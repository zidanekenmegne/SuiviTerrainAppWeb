from flask import Flask  # 1. J'importe la classe Flask

app = Flask(__name__)    # 2. Je crée une instance de l'application

@app.route('/')          # 3. Je définis une route (l'URL "/")
def hello():
    return "Bienvenue sur SuiviTerrain !"

if __name__ == '__main__':
    app.run(debug=True)  # 4. Je lance le serveur