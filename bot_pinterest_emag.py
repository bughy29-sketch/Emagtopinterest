import os
import requests
from google import genai

# Preluare date din secretele GitHub (sau variabile de mediu locale)
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
PINTEREST_ACCESS_TOKEN = os.environ.get("PINTEREST_ACCESS_TOKEN")
PINTEREST_BOARD_ID = os.environ.get("PINTEREST_BOARD_ID")

client = genai.Client(api_key=GEMINI_API_KEY)



# ------------------------------------------------------------------------------
# 1. FUNCȚIE PENTRU GENERAT TEXT OPTIMIZAT PENTRU PINTEREST
# ------------------------------------------------------------------------------
def generate_pin_details(product_title, product_category):
    prompt = f"""
    Creează conținut optimizat pentru Pinterest în limba română pentru un produs eMAG:
    - Titlu produs: {product_title}
    - Categorie: {product_category}

    Cerințe:
    1. Titlu Pin: Atractiv, scurt, cu cuvinte cheie cautate (max 100 caractere).
    2. Descriere: 2-3 fraze persuasive, axate pe beneficii, urmate de un Call To Action ("Apasă pentru detalii și preț pe eMAG").
    3. Hashtag-uri: 4-5 hashtag-uri relevante la final.

    Format răspuns strict:
    TITLU: [Titlul tău aici]
    DESCRIERE: [Descrierea ta aici]
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    # Separăm titlul și descrierea din răspuns
    text = response.text
    title = ""
    description = ""
    
    for line in text.split("\n"):
        if line.startswith("TITLU:"):
            title = line.replace("TITLU:", "").strip()
        elif line.startswith("DESCRIERE:"):
            description = line.replace("DESCRIERE:", "").strip()

    return title, description

# ------------------------------------------------------------------------------
# 2. FUNCȚIE PENTRU PUBLICARE PIN PRIN PINTEREST API v5
# ------------------------------------------------------------------------------
def create_pinterest_pin(board_id, title, description, link_afiliat, image_url):
    url = "https://api.pinterest.com/v5/pins"
    
    headers = {
        "Authorization": f"Bearer {PINTEREST_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "board_id": board_id,
        "title": title[:100],  # Limita Pinterest este de 100 caractere
        "description": description[:800],
        "link": link_afiliat,
        "media_source": {
            "source_type": "image_url",
            "url": image_url
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 201:
        print("✅ Pin creat cu succes!")
        return response.json()
    else:
        print(f"❌ Eroare la crearea Pin-ului [{response.status_code}]:", response.text)
        return None

# ------------------------------------------------------------------------------
# 3. EXEMPLU RULARE
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    # Date test produs eMAG / 2Performant / Profitshare
    produs_test = {
        "titlu": "Aspirator fara sac Rowenta Compact Power XXL 550W",
        "categorie": "Electrocasnice & Curățenie",
        "imagine": "https://s13emagst.akamaized.net/products/32812/32811451/images/res_6df4598440530ed5845c22ee3a6cb6e7.jpg",
        "link_afiliat": "https://l.profitshare.ro/l/16706445"
    }

    print("🤖 Generăm titlu și descriere cu Gemini...")
    titlu_pin, descriere_pin = generate_pin_details(produs_test["titlu"], produs_test["categorie"])
    
    print(f"\n📌 Titlu generat: {titlu_pin}")
    print(f"📝 Descriere generată:\n{descriere_pin}\n")

    # Decomentează linia de mai jos când ai configurat Token-ul Pinterest și Board ID
    # create_pinterest_pin(PINTEREST_BOARD_ID, titlu_pin, descriere_pin, produs_test["link_afiliat"], produs_test["imagine"])