"""
courses.py — Course recommendation engine for SkillMap
───────────────────────────────────────────────────────
No API key needed. Generates direct deep-search links for each
missing skill across 5 major learning platforms.
"""

from functools import lru_cache

PLATFORMS = [
    {
        "name":   "Coursera",
        "emoji":  "🎓",
        "color":  "#0056D2",
        "badge":  "Free audit available",
        "url":    lambda s: f"https://www.coursera.org/search?query={s.replace(' ', '%20')}",
    },
    {
        "name":   "Udemy",
        "emoji":  "🎯",
        "color":  "#A435F0",
        "badge":  "Paid · frequent discounts",
        "url":    lambda s: f"https://www.udemy.com/courses/search/?q={s.replace(' ', '+')}",
    },
    {
        "name":   "LinkedIn Learning",
        "emoji":  "💼",
        "color":  "#0A66C2",
        "badge":  "Free 1-month trial",
        "url":    lambda s: f"https://www.linkedin.com/learning/search?keywords={s.replace(' ', '%20')}",
    },
    {
        "name":   "edX",
        "emoji":  "🏛️",
        "color":  "#00262B",
        "badge":  "Free audit available",
        "url":    lambda s: f"https://www.edx.org/search?q={s.replace(' ', '+')}",
    },
    {
        "name":   "YouTube",
        "emoji":  "▶️",
        "color":  "#FF0000",
        "badge":  "Free",
        "url":    lambda s: f"https://www.youtube.com/results?search_query={s.replace(' ', '+')}+full+course",
    },
]


@lru_cache(maxsize=256)
def get_courses(skill: str) -> list:
    return [
        {
            "title":    f"{skill} — courses & certifications",
            "url":      p["url"](skill),
            "provider": p["name"],
            "emoji":    p["emoji"],
            "color":    p["color"],
            "badge":    p["badge"],
            "rating":   None,
            "source":   "link",
        }
        for p in PLATFORMS
    ]


def get_courses_for_skills(skills: list, max_per_skill: int = 3) -> dict:
    """
    Returns { skill -> [course, ...] } for top missing skills.
    max_per_skill=3 shows Coursera, Udemy, LinkedIn Learning.
    """
    return {
        skill: get_courses(skill)[:max_per_skill]
        for skill in skills[:6]
    }