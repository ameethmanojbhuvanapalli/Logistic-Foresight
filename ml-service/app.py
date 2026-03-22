import os
import logging
from flask import Flask
from flask_cors import CORS
from py_eureka_client import eureka_client

from routes.counter_routes   import counter_bp
from routes.forecast_routes  import forecast_bp
from routes.clustering_routes import clustering_bp
from routes.routing_routes   import routing_bp

from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.secret_key = os.getenv('SECRET_KEY', 'dev-secret')

    # Register blueprints — app.py owns no business logic
    app.register_blueprint(counter_bp,    url_prefix='/counter')
    app.register_blueprint(forecast_bp,   url_prefix='/forecast')
    app.register_blueprint(clustering_bp, url_prefix='/cluster')
    app.register_blueprint(routing_bp,    url_prefix='/route')

    @app.route('/health', methods=['GET'])
    def health():
        return {'status': 'ok', 'service': 'ml-service'}

    return app


def register_eureka(app):
    eureka_server = os.getenv('EUREKA_SERVER')
    if not eureka_server:
        logger.warning('EUREKA_SERVER not set — skipping Eureka registration')
        return

    host = os.getenv('INSTANCE_HOST', 'localhost')
    port = int(os.getenv('PORT', 5000))

    eureka_client.init(
        app_name='ML-Service',
        instance_port=port,
        instance_host=host,
        eureka_server=eureka_server,
    )
    logger.info(f'Registered with Eureka at {eureka_server}')


if __name__ == '__main__':
    app = create_app()
    register_eureka(app)
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
