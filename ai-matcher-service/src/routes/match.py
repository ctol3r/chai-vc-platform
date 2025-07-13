from flask import Blueprint, request, jsonify

match_blueprint = Blueprint('match', __name__)


def recompute_matches(entity_type: str, entity_id: str):
    """Placeholder implementation for match recomputation."""
    # In a real system, this would trigger the matching algorithm.
    print(f"Recomputing matches for {entity_type} {entity_id}")


@match_blueprint.route('/profiles', methods=['POST'])
def new_profile():
    data = request.get_json(force=True, silent=True) or {}
    profile_id = data.get('profile_id')
    if not profile_id:
        return jsonify({'error': 'profile_id is required'}), 400
    recompute_matches('profile', profile_id)
    return jsonify({'status': 'recomputed'}), 200


@match_blueprint.route('/jobs', methods=['POST'])
def new_job():
    data = request.get_json(force=True, silent=True) or {}
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({'error': 'job_id is required'}), 400
    recompute_matches('job', job_id)
    return jsonify({'status': 'recomputed'}), 200
