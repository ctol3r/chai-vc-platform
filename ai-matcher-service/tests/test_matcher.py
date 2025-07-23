# test_matcher.py - placeholder for chai-vc-platform

def test_placeholder():
    """Placeholder test to ensure pytest runs successfully."""
    assert True


def test_verify_endpoint_has_cors_headers():
    """The /verify endpoint should include CORS headers."""
    import importlib.util
    import sys
    from pathlib import Path

    module_path = Path(__file__).resolve().parents[1] / 'src' / 'embed_widget.py'
    spec = importlib.util.spec_from_file_location('embed_widget', module_path)
    embed_widget = importlib.util.module_from_spec(spec)
    sys.modules['embed_widget'] = embed_widget
    spec.loader.exec_module(embed_widget)

    app = embed_widget.app
    with app.test_client() as client:
        resp = client.get('/verify/test-id')
        assert resp.status_code == 200
        # Flask-CORS sets Access-Control-Allow-Origin to '*'
        assert resp.headers.get('Access-Control-Allow-Origin') == '*'

