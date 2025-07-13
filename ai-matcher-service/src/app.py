from flask import Flask
from routes.match import match_blueprint


def create_app() -> Flask:
    app = Flask(__name__)
    app.register_blueprint(match_blueprint)
    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000)
