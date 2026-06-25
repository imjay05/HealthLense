const HEALTH_TIPS = [
  {
    tip: "Drink at least 8 glasses of water daily. Staying hydrated improves energy, focus, and kidney function.",
    icon: "💧",
    category: "Hydration",
  },
  {
    tip: "Never skip breakfast. A nutritious morning meal kickstarts your metabolism and improves concentration.",
    icon: "🍳",
    category: "Nutrition",
  },
  {
    tip: "Walk at least 30 minutes every day. Even a simple walk after dinner aids digestion and heart health.",
    icon: "🚶",
    category: "Exercise",
  },
  {
    tip: "Sleep 7-8 hours every night. Quality sleep repairs your body, sharpens memory, and balances hormones.",
    icon: "😴",
    category: "Sleep",
  },
  {
    tip: "Eat more fruits and vegetables. Aim for 5 servings a day to get essential vitamins and antioxidants.",
    icon: "🥦",
    category: "Nutrition",
  },
  {
    tip: "Avoid sugary drinks. Replace sodas and packaged juices with water, lemon water, or coconut water.",
    icon: "🚫",
    category: "Nutrition",
  },
  {
    tip: "Practice deep breathing for 5 minutes daily. It reduces stress, lowers blood pressure, and calms the mind.",
    icon: "🧘",
    category: "Mental Health",
  },
  {
    tip: "Wash your hands frequently. Proper handwashing prevents 80% of common infections and illnesses.",
    icon: "🧼",
    category: "Hygiene",
  },
  {
    tip: "Limit screen time before bed. Blue light from phones disrupts melatonin and ruins sleep quality.",
    icon: "📵",
    category: "Sleep",
  },
  {
    tip: "Eat slowly and chew your food well. This improves digestion and helps you feel full with less food.",
    icon: "🍽️",
    category: "Nutrition",
  },
  {
    tip: "Take a 5-minute break every hour if you sit at a desk. Prolonged sitting increases risk of back pain and heart disease.",
    icon: "⏱️",
    category: "Exercise",
  },
  {
    tip: "Include protein in every meal. Protein keeps you full longer and supports muscle repair and growth.",
    icon: "🥚",
    category: "Nutrition",
  },
  {
    tip: "Go outside for at least 15 minutes of sunlight daily. Sunlight is the best natural source of Vitamin D.",
    icon: "☀️",
    category: "Wellness",
  },
  {
    tip: "Reduce salt intake. Too much sodium raises blood pressure and increases risk of stroke and kidney disease.",
    icon: "🧂",
    category: "Nutrition",
  },
  {
    tip: "Practice gratitude daily. Writing 3 things you are thankful for improves mental health and reduces anxiety.",
    icon: "📝",
    category: "Mental Health",
  },
  {
    tip: "Get a full body health checkup once a year. Early detection of problems saves lives and reduces treatment costs.",
    icon: "🏥",
    category: "Prevention",
  },
  {
    tip: "Avoid smoking and secondhand smoke. Smoking damages lungs, heart, and nearly every organ in your body.",
    icon: "🚭",
    category: "Prevention",
  },
  {
    tip: "Stretch for 10 minutes every morning. Morning stretches improve flexibility, posture, and blood circulation.",
    icon: "🤸",
    category: "Exercise",
  },
  {
    tip: "Eat a handful of nuts daily. Almonds, walnuts, and cashews are rich in healthy fats, fiber, and minerals.",
    icon: "🥜",
    category: "Nutrition",
  },
  {
    tip: "Limit alcohol consumption. Excess alcohol damages the liver, disrupts sleep, and weakens the immune system.",
    icon: "🍷",
    category: "Prevention",
  },
  {
    tip: "Stay socially connected. Strong relationships with friends and family reduce stress and improve longevity.",
    icon: "🤝",
    category: "Mental Health",
  },
  {
    tip: "Monitor your blood pressure regularly. High BP has no symptoms but silently damages your heart and kidneys.",
    icon: "❤️",
    category: "Prevention",
  },
  {
    tip: "Cook at home more often. Home-cooked meals have less oil, salt, and preservatives than restaurant food.",
    icon: "👨‍🍳",
    category: "Nutrition",
  },
  {
    tip: "Keep your vaccinations up to date. Vaccines protect you and your community from serious preventable diseases.",
    icon: "💉",
    category: "Prevention",
  },
  {
    tip: "Reduce stress with hobbies. Reading, painting, or gardening lower cortisol levels and improve mood.",
    icon: "🎨",
    category: "Mental Health",
  },
  {
    tip: "Check your blood sugar levels annually. Diabetes often develops silently without obvious symptoms for years.",
    icon: "🩸",
    category: "Prevention",
  },
  {
    tip: "Maintain a healthy weight. Even losing 5-10% of body weight significantly reduces risk of diabetes and heart disease.",
    icon: "⚖️",
    category: "Wellness",
  },
  {
    tip: "Avoid eating late at night. Late-night meals disrupt digestion, cause acidity, and lead to weight gain.",
    icon: "🌙",
    category: "Nutrition",
  },
  {
    tip: "Wear sunscreen daily. UV rays cause skin aging and skin cancer even on cloudy days.",
    icon: "🧴",
    category: "Hygiene",
  },
  {
    tip: "Do strength training twice a week. Building muscle improves metabolism, posture, and bone density.",
    icon: "💪",
    category: "Exercise",
  },
  {
    tip: "Eat iron-rich foods like spinach, lentils, and dates. Iron deficiency is the most common nutritional deficiency in India.",
    icon: "🥬",
    category: "Nutrition",
  },
  {
    tip: "Stay mentally active. Reading, puzzles, and learning new skills keep your brain sharp as you age.",
    icon: "🧠",
    category: "Mental Health",
  },
  {
    tip: "Keep your living space clean and ventilated. Poor air quality indoors causes allergies, asthma, and fatigue.",
    icon: "🏠",
    category: "Hygiene",
  },
  {
    tip: "Eat fiber-rich foods daily. Fiber from whole grains, fruits, and vegetables keeps your gut healthy and prevents constipation.",
    icon: "🌾",
    category: "Nutrition",
  },
  {
    tip: "Practice good posture while sitting. Poor posture causes chronic back and neck pain over time.",
    icon: "🪑",
    category: "Wellness",
  },
  {
    tip: "Take care of your dental health. Brush twice a day and floss daily. Poor oral health is linked to heart disease.",
    icon: "🦷",
    category: "Hygiene",
  },
  {
    tip: "Avoid self-medicating. Always consult a doctor before taking any medicine, even common painkillers.",
    icon: "⚠️",
    category: "Prevention",
  },
  {
    tip: "Include omega-3 fatty acids in your diet. Fish, flaxseeds, and walnuts reduce inflammation and protect the heart.",
    icon: "🐟",
    category: "Nutrition",
  },
  {
    tip: "Take the stairs instead of the elevator. Small movements throughout the day add up to significant health benefits.",
    icon: "🪜",
    category: "Exercise",
  },
  {
    tip: "Keep track of your medications and reports. Organized health records help doctors give you better treatment.",
    icon: "📋",
    category: "Prevention",
  },
  {
    tip: "Laugh more every day. Laughter reduces stress hormones, boosts immunity, and improves heart health.",
    icon: "😂",
    category: "Mental Health",
  },
  {
    tip: "Eat seasonal and local fruits. Seasonal produce is fresher, more nutritious, and better for your body.",
    icon: "🍉",
    category: "Nutrition",
  },
  {
    tip: "Avoid skipping meals. Irregular eating patterns disturb metabolism and can cause acidity and fatigue.",
    icon: "⏰",
    category: "Nutrition",
  },
  {
    tip: "Check your eye health every year. Many vision problems and diseases like glaucoma are caught early with regular checkups.",
    icon: "👁️",
    category: "Prevention",
  },
  {
    tip: "Listen to your body. Persistent fatigue, pain, or unusual changes are signals to see a doctor, not ignore.",
    icon: "🩺",
    category: "Wellness",
  },
];


export const getDailyTip = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
  );
  const index = dayOfYear % HEALTH_TIPS.length;
  return HEALTH_TIPS[index];
};