import csv
import io
import json
import random

# This is the content of your jac.csv file as a single string.  It's more robust
# to define it directly here rather than reading from a file, for this example.
jac_csv_data = """Branch,Region,OPEN,EWS,OBC,SC,ST,GNSGD
Computer Science and Engineering (CSE),Delhi Region,13567,25062,57096,122763,361124,15060
Information Technology (IT),Delhi Region,17916,27361,71245,140198,494782,20928
Software Engineering (SE),Delhi Region,21614,30793,83824,175806,515808,24512
Mathematics and Computing (MCE),Delhi Region,24053,35773,93741,213200,967013,26715
Electronics and Communication Engineering (ECE),Delhi Region,28173,41619,109062,222834,1176223,31492
Electrical Engineering (EE),Delhi Region,37098,56169,149952,346626,1268457,54011
Mechanical Engineering (ME),Delhi Region,54356,79877,203069,459706,732816,100098
Mechanical Engineering with specialization in Automotive Engineering (MAM),Delhi Region,56014,86511,210234,479584,81079
Engineering Physics (EP),Delhi Region,53492,82675,200510,615180,96283
Chemical Engineering (CHE),Delhi Region,62712,103693,254518,618505,95849
Civil Engineering (CE),Delhi Region,71914,118803,294176,580756,468166,112350
Production Industrial Engineering (PIE),Delhi Region,65734,113617,317506,812707,120929
Environmental Engineering (ENE),Delhi Region,75960,137948,382735,924695,104831
Bio Technology (BT),Delhi Region,76007,141758,320922,738541,83845
Branch,Region,OPEN,EWS,OBC,SC,ST
Computer Science Engineering (CSE),Outside Delhi Region,6406,10421,12590,66040,88837
Information Technology (IT),Outside Delhi Region,6871,12088,15893,73585,125374
Software Engineering (SE),Outside Delhi Region,10046,14131,21624,86411,106627
Mathematics and Computing (MCE),Outside Delhi Region,10289,14223,24179,96377,129675
Electronics and Communication Engineering (ECE),Outside Delhi Region,11787,15529,25615,99941,151748
Electrical Engineering (EE),Outside Delhi Region,15907,17614,33509,128524,194690
Mechanical Engineering (ME),Outside Delhi Region,20977,24501,44147,170442,260436
Mechanical Engineering with specialization in Automotive Engineering (MAM),Outside Delhi Region,16830,23791,45219,173048,368939
Engineering Physics (EP),Outside Delhi Region,19657,24442,49002,187998,375857
Chemical Engineering (CHE),Outside Delhi Region,22845,25367,50025,180128,206487
Civil Engineering (CE),Outside Delhi Region,28180,37215,53032,178296,252579
Production Industrial Engineering (PIE),Outside Delhi Region,25875,29899,54184,188464,383834
Environmental Engineering (ENE),Outside Delhi Region,27789,37686,55534,201699,387956
Bio Technology (BT),Outside Delhi Region,26859,37660,55770,197944,282632
"""


def convert_csv_to_json(csv_data):
    """
    Converts CSV data to a JSON format suitable for web display,
    following the specified transformations.

    Args:
        csv_data (str): A string containing the CSV data.

    Returns:
        str: A JSON string representing the transformed data.
    """
    f = io.StringIO(csv_data)
    reader = csv.DictReader(f, skipinitialspace=True)
    output_data = []

    institute_name = "Delhi Technological University"
    city = "Delhi"
    state = "Delhi"
    college_type = "JAC" # Changed to JAC

    for row in reader:
        #print(row)
        branch = row.get("Branch", "") + " (4 Years, Bachelor of Technology)" # Added degree name
        region = row.get("Region", "")
        open_rank = row.get("OPEN", "")
        ews_rank = row.get("EWS", "")
        obc_rank = row.get("OBC", "")
        sc_rank = row.get("SC", "")
        st_rank = row.get("ST", "")
        #gnsgd_rank = row.get("GNSGD", "") # Ignore GNSGD


        quota = "HS" if region == "Delhi Region" else "OS"

        categories = ["OPEN", "EWS", "OBC", "SC", "ST"]
        ranks = [open_rank, ews_rank, obc_rank, sc_rank, st_rank]
        #print(ranks)

        for category, rank in zip(categories, ranks):
            if rank:
                category_name = "OPEN" if category == "OPEN" else \
                                "EWS" if category == "EWS" else \
                                "OBC-NCL" if category == "OBC" else \
                                "SC" if category == "SC" else "ST"
                try:
                    closing_rank = int(rank)
                    # Calculate opening rank with a 20-30% random error
                    opening_rank_min = int(closing_rank * 0.7)  # 70% of closing rank
                    opening_rank_max = int(closing_rank * 0.8)  # 80% of closing rank
                    opening_rank = random.randint(opening_rank_min, opening_rank_max)
                except ValueError:
                    # Handle the case where rank is not a valid integer (e.g., empty string, "NA")
                    opening_rank = ""
                    closing_rank = ""

                output_data.append({
                    "institute": institute_name,
                    "branch": branch,
                    "quota": quota,
                    "category": category_name,
                    "gender": "Gender-Neutral",
                    "openingRank": str(opening_rank),  #opening rank added
                    "closingRank": str(closing_rank),
                    "city": city,
                    "state": state,
                    "type": college_type,
                })
    return json.dumps(output_data, indent=4)



# Process the CSV data and convert it to JSON
json_output = convert_csv_to_json(jac_csv_data)
print(json_output)

# Save the JSON output to a file (optional)
with open("dtu_data.json", "w") as outfile:
    outfile.write(json_output)

print("Data saved to dtu_data.json")
