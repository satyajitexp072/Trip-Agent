import { aiService } from '../services/ai.service.js';
import { executeTripModification } from '../services/tripOptimizer.service.js';
import { Trip } from '../models/Trip.js';

/**
 * Handle AI conversational chat & selective trip modification
 * POST /api/ai/chat
 */
export const handleAIChat = async (req, res, next) => {
  try {
    const {
      message = '',
      tripId = null,
      currentContext = {},
      tripState = null,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required for AI chat.',
      });
    }

    // 1. Establish working trip context
    let baseTrip = null;
    let dbTrip = null;

    if (tripId && tripId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        dbTrip = await Trip.findById(tripId);
        if (dbTrip) {
          baseTrip = dbTrip.toObject();
        }
      } catch (err) {
        console.warn('[AIController] Trip lookup error:', err.message);
      }
    }

    if (!baseTrip) {
      baseTrip = tripState || {
        origin: currentContext.origin || 'Bhubaneswar',
        destination: currentContext.destination || 'Goa',
        duration: Number(currentContext.duration || currentContext.durationDays || 4),
        durationDays: Number(currentContext.duration || currentContext.durationDays || 4),
        travelers: Number(currentContext.travelers || 2),
        interests: currentContext.interests || ['Beaches', 'Food', 'Relaxed'],
        travelStyle: currentContext.travelStyle || 'Relaxed',
        selectedBudgetTier: currentContext.selectedBudgetTier || 'bestValue',
        totalCost: currentContext.totalCost || 36500,
        perPersonCost: currentContext.perPersonCost || 18250,
        accommodation: {
          name: 'BloomSuites Boutique & Spa, Calangute',
          type: 'Boutique Hotel',
          costPerNight: 3300,
          totalCost: 9900,
          nights: 3,
        },
        transport: {
          mode: 'Flight',
          provider: 'IndiGo Airlines',
          duration: '2h 35m',
          totalCost: 11800,
        },
        itinerary: [],
      };
    }

    // 2. Extract travel intent and interpret modification directive
    const travelIntent = await aiService.extractTravelIntent(message, baseTrip);
    const interpretation = await aiService.interpretModification(message, baseTrip);

    // 3. Execute deterministic backend modification
    const operationResult = await executeTripModification(baseTrip, interpretation);

    // 4. If persisted in DB, save selective updates
    if (dbTrip) {
      if (operationResult.updatedTrip.duration) dbTrip.duration = operationResult.updatedTrip.duration;
      if (operationResult.updatedTrip.travelers) dbTrip.travelers = operationResult.updatedTrip.travelers;
      if (operationResult.updatedTrip.selectedBudgetTier) dbTrip.selectedBudgetTier = operationResult.updatedTrip.selectedBudgetTier;
      if (operationResult.updatedTrip.optionalBudget !== undefined) dbTrip.optionalBudget = operationResult.updatedTrip.optionalBudget;
      if (operationResult.updatedTrip.budgetEstimate) dbTrip.budgetEstimate = operationResult.updatedTrip.budgetEstimate;
      await dbTrip.save();
    }

    // 5. Generate conversational response & explanation
    const reply = aiService.generateConversationalResponse(message, operationResult, baseTrip);
    const explanation = aiService.generateJourneyExplanation(
      operationResult.updatedTrip,
      operationResult.updatedTrip.selectedBudgetTier || 'Best Value',
      travelIntent.constraints
    );

    return res.status(200).json({
      status: 'success',
      reply,
      action: interpretation.action,
      affectedComponent: interpretation.affectedComponent,
      delta: operationResult.delta,
      summary: operationResult.summary,
      details: operationResult.details,
      travelIntent,
      explanation,
      updatedTrip: operationResult.updatedTrip,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Direct intent extraction endpoint
 * POST /api/ai/intent
 */
export const handleExtractIntent = async (req, res, next) => {
  try {
    const { message = '', currentContext = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Message is required to extract travel intent.',
      });
    }

    const intent = await aiService.extractTravelIntent(message, currentContext);

    return res.status(200).json({
      status: 'success',
      data: intent,
    });
  } catch (error) {
    next(error);
  }
};
