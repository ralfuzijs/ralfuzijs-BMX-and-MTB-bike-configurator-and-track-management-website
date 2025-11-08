const BikeSizeCalc = require('../models/bike-size-calc');

// MTB Frame Size Calculator Logic
const calculateMTBFrameSize = (height) => {
  // Height in cm - Mountain Bike sizes
  if (height < 150) return "XS (13-14\")";
  if (height >= 150 && height < 160) return "S (15-16\")";
  if (height >= 160 && height < 170) return "M (17-18\")";
  if (height >= 170 && height < 180) return "L (19-20\")";
  if (height >= 180 && height < 190) return "XL (21-22\")";
  if (height >= 190) return "XXL (23\"+)";
  return "M (17-18\")"; // fallback
};

// BMX Freestyle Frame Size Calculator Logic
const calculateBMXFreestyleFrameSize = (height) => {
  // Height in cm - BMX Freestyle (for tricks and parks)
  if (height < 120) return "Micro (12\" or smaller)";
  if (height >= 120 && height < 135) return "Mini (16\")";
  if (height >= 135 && height < 150) return "Junior (18\")";
  if (height >= 150 && height < 165) return "Expert (20\")";
  if (height >= 165 && height < 175) return "Pro (20.5\")";
  if (height >= 175 && height < 185) return "Pro XL (21\")";
  if (height >= 185) return "Pro XXL (21.5\" or larger)";
  return "Expert (20\")"; // fallback
};

// BMX Racing Frame Size Calculator Logic
const calculateBMXRacingFrameSize = (height) => {
  // Height in cm - BMX Racing (optimized for speed and competition)
  if (height < 120) return "Micro (12\" or smaller)";
  if (height >= 120 && height < 130) return "Mini (14-16\")";
  if (height >= 130 && height < 145) return "Junior (17-18\")";
  if (height >= 145 && height < 160) return "Expert (19-20\")";
  if (height >= 160 && height < 170) return "Pro (20.5-21\")";
  if (height >= 170 && height < 180) return "Pro XL (21-21.5\")";
  if (height >= 180) return "Pro XXL (21.75\" or larger)";
  return "Expert (19-20\")"; // fallback
};

// Calculate bike size
const calculateBikeSize = async (req, res) => {
  try {
    const { height, bikeType = 'MTB' } = req.body;
    
    if (!height || height < 50 || height > 250) {
      return res.status(400).json({
        success: false,
        error: 'Height must be between 50cm and 250cm'
      });
    }

    let recommendedFrameSize;
    switch (bikeType) {
      case 'MTB':
        recommendedFrameSize = calculateMTBFrameSize(height);
        break;
      case 'BMX_FREESTYLE':
        recommendedFrameSize = calculateBMXFreestyleFrameSize(height);
        break;
      case 'BMX_RACING':
        recommendedFrameSize = calculateBMXRacingFrameSize(height);
        break;
      default:
        recommendedFrameSize = calculateMTBFrameSize(height);
    }

    res.json({
      success: true,
      data: {
        height,
        bikeType,
        recommendedFrameSize,
        calculation: {
          heightRange: getHeightRange(height),
          recommendation: getRecommendationText(height, bikeType)
        }
      }
    });
  } catch (error) {
    console.error('Calculate bike size error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during calculation'
    });
  }
};

// Save calculation for logged-in user
const saveBikeSizeCalculation = async (req, res) => {
  try {
    const { height, bikeType = 'MTB' } = req.body;
    const userId = req.user.id;

    if (!height || height < 50 || height > 250) {
      return res.status(400).json({
        success: false,
        error: 'Height must be between 50cm and 250cm'
      });
    }

    let recommendedFrameSize;
    switch (bikeType) {
      case 'MTB':
        recommendedFrameSize = calculateMTBFrameSize(height);
        break;
      case 'BMX_FREESTYLE':
        recommendedFrameSize = calculateBMXFreestyleFrameSize(height);
        break;
      case 'BMX_RACING':
        recommendedFrameSize = calculateBMXRacingFrameSize(height);
        break;
      default:
        recommendedFrameSize = calculateMTBFrameSize(height);
    }

    const calculation = await BikeSizeCalc.create({
      userId,
      height,
      recommendedFrameSize,
      bikeType
    });

    res.json({
      success: true,
      message: 'Bike size calculation saved successfully',
      data: calculation
    });
  } catch (error) {
    console.error('Save bike size calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while saving calculation'
    });
  }
};

// Get user's saved calculations
const getUserCalculations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const calculations = await BikeSizeCalc.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: calculations
    });
  } catch (error) {
    console.error('Get user calculations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching calculations'
    });
  }
};

// Delete a calculation
const deleteCalculation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const calculation = await BikeSizeCalc.findOne({
      where: { id, userId }
    });

    if (!calculation) {
      return res.status(404).json({
        success: false,
        error: 'Calculation not found'
      });
    }

    await calculation.destroy();

    res.json({
      success: true,
      message: 'Calculation deleted successfully'
    });
  } catch (error) {
    console.error('Delete calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting calculation'
    });
  }
};

// Helper functions
const getHeightRange = (height) => {
  if (height < 120) return "Under 120cm";
  if (height >= 120 && height < 135) return "120-135cm";
  if (height >= 135 && height < 150) return "135-150cm";
  if (height >= 150 && height < 165) return "150-165cm";
  if (height >= 165 && height < 175) return "165-175cm";
  if (height >= 175 && height < 185) return "175-185cm";
  if (height >= 185) return "185cm+";
  return "Standard";
};

const getRecommendationText = (height, bikeType) => {
  if (bikeType === 'MTB') {
    if (height < 150) return "Perfect for smaller riders or youth mountain biking";
    if (height >= 150 && height < 160) return "Great for agile trail riding and technical sections";
    if (height >= 160 && height < 170) return "Ideal medium size for most trail and cross-country riding";
    if (height >= 170 && height < 180) return "Perfect for aggressive trail riding and all-mountain use";
    if (height >= 180 && height < 190) return "Excellent for tall riders seeking stability and control";
    if (height >= 190) return "Optimal for very tall riders, providing maximum comfort";
  } else if (bikeType === 'BMX_FREESTYLE') {
    if (height < 120) return "Perfect for young kids just starting BMX freestyle";
    if (height >= 120 && height < 135) return "Great for children learning tricks and park basics";
    if (height >= 135 && height < 150) return "Ideal for young riders developing freestyle skills";
    if (height >= 150 && height < 165) return "Standard freestyle size for most park riders";
    if (height >= 165 && height < 175) return "Pro size for experienced freestyle riders";
    if (height >= 175 && height < 185) return "Large frame for tall freestyle riders";
    if (height >= 185) return "Extra large frame for very tall freestyle riders";
  } else if (bikeType === 'BMX_RACING') {
    if (height < 120) return "Perfect for young racers starting their BMX racing journey";
    if (height >= 120 && height < 130) return "Great for kids learning racing techniques";
    if (height >= 130 && height < 145) return "Ideal for junior racers developing speed skills";
    if (height >= 145 && height < 160) return "Optimized for competitive youth racing";
    if (height >= 160 && height < 170) return "Professional racing size for speed and agility";
    if (height >= 170 && height < 180) return "Pro racing frame for tall competitive riders";
    if (height >= 180) return "Maximum performance for very tall racers";
  }
  return "Recommended size based on your height";
};

module.exports = {
  calculateBikeSize,
  saveBikeSizeCalculation,
  getUserCalculations,
  deleteCalculation
};
