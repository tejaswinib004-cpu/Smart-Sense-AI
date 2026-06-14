RECOMMENDATIONS = {
    "Low": [
        {
            "icon": "🧘",
            "title": "Maintain Mindfulness",
            "desc": "Continue daily 10-min meditation or deep breathing to sustain low stress.",
        },
        {"icon": "🏃", "title": "Regular Exercise", "desc": "30 mins of aerobic activity 4x/week sustains mood and cognitive function."},
        {"icon": "📚", "title": "Keep Learning", "desc": "Engage curiosity with books, courses, or new hobbies to maintain mental sharpness."},
        {"icon": "🤝", "title": "Social Connection", "desc": "Nurture 2-3 close relationships. Quality over quantity in social support."},
        {"icon": "😴", "title": "Sleep Hygiene", "desc": "Consistent 7-9h sleep schedule even on weekends. No screens 1h before bed."},
    ],
    "Moderate": [
        {
            "icon": "📝",
            "title": "Stress Journal",
            "desc": "Write 3 stressors & 3 gratitudes daily. Pattern recognition reduces reactivity.",
        },
        {
            "icon": "⏱️",
            "title": "Pomodoro Technique",
            "desc": "25 min work + 5 min break cycles. Prevents academic burnout effectively.",
        },
        {
            "icon": "🧠",
            "title": "CBT Reframing",
            "desc": "Identify catastrophic thoughts and replace with balanced, evidence-based ones.",
        },
        {
            "icon": "🎵",
            "title": "Music Therapy",
            "desc": "60 BPM instrumental music (baroque/lo-fi) while studying reduces cortisol.",
        },
        {"icon": "👥", "title": "Peer Support Group", "desc": "Join or start a study group. Shared struggle reduces isolation significantly."},
        {"icon": "🌿", "title": "Nature Walks", "desc": "20 min in green spaces reduces amygdala activity measurably. Daily if possible."},
    ],
    "High": [
        {
            "icon": "🚨",
            "title": "Seek Professional Help",
            "desc": "Consult a counselor or therapist immediately. High stress needs clinical support.",
        },
        {
            "icon": "📵",
            "title": "Digital Detox",
            "desc": "Limit social media to 30 min/day. Comparison culture amplifies perceived stress.",
        },
        {
            "icon": "🫁",
            "title": "4-7-8 Breathing",
            "desc": "Inhale 4s, hold 7s, exhale 8s. Activates parasympathetic nervous system instantly.",
        },
        {
            "icon": "🛏️",
            "title": "Prioritize Sleep",
            "desc": "Sleep deprivation amplifies stress 3x. Establish strict sleep schedule this week.",
        },
        {
            "icon": "🥗",
            "title": "Anti-Stress Diet",
            "desc": "Omega-3s, magnesium, B-vitamins. Avoid caffeine after 2PM and ultra-processed foods.",
        },
        {
            "icon": "📋",
            "title": "Workload Reduction",
            "desc": "Drop 1-2 non-essential commitments immediately. Your health is the priority.",
        },
        {
            "icon": "🆘",
            "title": "Crisis Resources",
            "desc": "iCall: 9152987821 | Vandrevala: 1860-2662-345 (24/7). You are not alone.",
        },
    ],
}


def get_recommendations(stress_level: str):
    return RECOMMENDATIONS.get(stress_level, [])
