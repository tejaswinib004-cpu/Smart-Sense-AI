CHATBOT_RESPONSES = {
    "stress": "Stress is your body's reaction to demands exceeding perceived resources. Chronic stress raises cortisol, impairing memory, immunity, and sleep. The good news: stress is manageable with consistent coping strategies.",
    "anxiety": "Anxiety and stress often co-occur but differ — stress is usually tied to external triggers, anxiety persists even without them. Both benefit from CBT, mindfulness, and regular exercise. Seek help if anxiety disrupts daily functioning.",
    "sleep": "Sleep is your brain's reset button. During deep sleep, the glymphatic system clears stress hormones and consolidates learning. Aim for 7-9 hours. Consistent wake times matter more than total hours for circadian health.",
    "meditation": "Even 10 minutes of daily mindfulness meditation measurably reduces amygdala reactivity within 8 weeks. Start with box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold. Apps like Insight Timer offer guided sessions.",
    "exercise": "Exercise is the most evidence-backed stress reducer. It releases BDNF (brain-derived neurotrophic factor), reduces cortisol, and improves sleep quality. Even a 20-min walk has immediate benefits.",
    "study": "Effective study reduces stress by increasing confidence. Use active recall over re-reading, space repetitions (Anki), and the Feynman technique. Study in 90-min ultradian blocks with proper breaks.",
    "help": "I can help with: stress management tips, understanding your results, study techniques, mental health resources, sleep advice, anxiety coping strategies. What would you like to explore?",
    "default": "That's a thoughtful question. Based on stress research, consistent self-monitoring, social support, and evidence-based coping strategies make the biggest difference. Would you like specific tips on managing a particular aspect of your wellbeing?",
}


def get_chat_response(msg: str) -> str:
    lower = msg.lower()
    if any(word in lower for word in ["sleep", "tired", "insomnia"]):
        return CHATBOT_RESPONSES["sleep"]
    if any(word in lower for word in ["meditat", "breath", "mindful"]):
        return CHATBOT_RESPONSES["meditation"]
    if any(word in lower for word in ["exercis", "walk", "sport", "gym"]):
        return CHATBOT_RESPONSES["exercise"]
    if any(word in lower for word in ["anxiety", "anxious", "panic"]):
        return CHATBOT_RESPONSES["anxiety"]
    if any(word in lower for word in ["study", "exam", "academ", "learn"]):
        return CHATBOT_RESPONSES["study"]
    if any(word in lower for word in ["help", "what can", "how"]):
        return CHATBOT_RESPONSES["help"]
    if any(word in lower for word in ["stress", "pressure", "overwhelm"]):
        return CHATBOT_RESPONSES["stress"]
    return CHATBOT_RESPONSES["default"]
