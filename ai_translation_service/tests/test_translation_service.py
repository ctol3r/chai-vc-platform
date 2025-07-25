import unittest
from unittest.mock import MagicMock

from ai_translation_service.translation_service import AITranslator

class TestAITranslator(unittest.TestCase):
    def test_translate(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock(message=MagicMock(content='Hola'))]
        mock_client.chat.completions.create.return_value = mock_response

        translator = AITranslator(client=mock_client)
        result = translator.translate('Hello', 'Spanish')
        self.assertEqual(result, 'Hola')
        mock_client.chat.completions.create.assert_called()

if __name__ == '__main__':
    unittest.main()
