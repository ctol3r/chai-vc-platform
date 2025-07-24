ROLE_SKILL_MAP = {
    "data scientist": [
        "Advanced machine learning",
        "Cloud data pipelines",
        "Big data tools",
    ],
    "software engineer": [
        "Cloud infrastructure",
        "System design patterns",
        "DevOps automation",
    ],
    "nurse": [
        "Digital health records",
        "Telehealth coordination",
        "Clinical informatics",
    ],
    "product manager": [
        "AI product strategy",
        "Data-driven decision making",
        "Agile frameworks",
    ],
}


def recommend_upskilling(role: str, skills=None):
    """Return recommended upskilling paths for a given role and current skills."""
    role_normalized = role.lower()
    skills = skills or []
    recommended = []

    for key, recs in ROLE_SKILL_MAP.items():
        if key in role_normalized:
            recommended = recs
            break
    else:
        recommended = [
            "AI fundamentals",
            "Data analytics",
            "Cloud basics",
        ]

    # Determine which recommendations the user is missing
    missing = [
        r for r in recommended if r.lower() not in {s.lower() for s in skills}
    ]

    return {
        "role": role,
        "recommended_skills": recommended,
        "missing_skills": missing,
    }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Career insights recommender")
    parser.add_argument("role", help="Target job role")
    parser.add_argument(
        "--skills",
        help="Comma separated list of existing skills",
        default="",
    )

    args = parser.parse_args()
    current_skills = [s.strip() for s in args.skills.split(",") if s.strip()]

    insights = recommend_upskilling(args.role, current_skills)
    print(json.dumps(insights, indent=2))

