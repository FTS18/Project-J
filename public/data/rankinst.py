import json

def rank_better_nits_iiits(file_path="data.json", output_file="ranked_better_nits_iiits.json"):
    """
    Ranks NITs and IIITs based on a preference for 'comp' branches, then
    by closing rank for 'OPEN' category, 'Gender-Neutral' candidates,
    using 'OS' quota for NITs and 'AI' quota for IIITs.
    The output is stored in a JSON file with colleges and their ranks.
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        return f"Error: {file_path} not found. Make sure the file is in the correct directory."
    except json.JSONDecodeError:
        return f"Error: Invalid JSON format in {file_path}."

    eligible_colleges = []

    for entry in data:
        institute = entry.get("institute")
        branch = entry.get("branch")
        category = entry.get("category")
        closing_rank = entry.get("closingRank")
        gender = entry.get("gender")
        quota = entry.get("quota")

        institute_type = ""
        if "National Institute of Technology" in institute:
            institute_type = "NIT"
        elif "Indian Institute of Information Technology" in institute:
            institute_type = "IIIT"

        required_quota = ""
        if institute_type == "NIT":
            required_quota = "OS"
        elif institute_type == "IIIT":
            required_quota = "AI"

        if (
            institute_type
            and branch
            and category == "OPEN"
            and closing_rank is not None
            and closing_rank.isdigit()
            and gender == "Gender-Neutral"
            and quota == required_quota
        ):
            is_comp_branch = "comp" in branch.lower()
            eligible_colleges.append({
                "institute": institute,
                "branch": branch,
                "closingRank": int(closing_rank),
                "is_comp_branch": is_comp_branch
            })

    # Sort colleges: first by preference for 'comp' branches (True < False), then by closing rank (ascending)
    ranked_colleges = sorted(eligible_colleges, key=lambda x: (not x["is_comp_branch"], x["closingRank"]))

    ranking_json = {}
    rank_counter = 1
    for college in ranked_colleges:
        if college["institute"] not in ranking_json:
            ranking_json[college["institute"]] = rank_counter
            rank_counter += 1

    try:
        with open(output_file, 'w') as outfile:
            json.dump(ranking_json, outfile, indent=4)
        return f"Ranking of better NITs and IIITs stored in {output_file}"
    except IOError:
        return f"Error: Could not write to {output_file}"

if __name__ == "__main__":
    output_message = rank_better_nits_iiits()
    print(output_message)