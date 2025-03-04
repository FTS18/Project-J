import requests

API_KEY = 'AIzaSyDh8TapG1jSltM-SN3ifE8Q--03xnsr-_o'
CX = '222dc440adf374266'  # Custom Search Engine ID

def get_college_image(college_name):
    url = f"https://www.googleapis.com/customsearch/v1?q={college_name}&searchType=image&key={API_KEY}&cx={CX}"
    response = requests.get(url)
    data = response.json()

    if 'items' in data:
        return data['items'][0]['link']  # Get the first image link
    return None  # No image found

# Example usage
college_name = "National Institute of Technology Durgapur"
image_url = get_college_image(college_name)
print(image_url)
