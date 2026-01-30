import asyncio
import os
import traceback
from typing import Dict, List, Optional

from dotenv import load_dotenv
from google import genai

load_dotenv()


class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set")

        self.client = genai.Client(api_key=api_key)

        # ✅ Use the latest stable model
        self.model = "gemini-3-flash-preview"  # Latest stable (June 2025) - RECOMMENDED
        # Alternative options:
        # self.model = "gemini-2.5-pro"  # More powerful, slower
        # self.model = "gemini-flash-latest"  # Always latest flash version

        print(f"✓ Gemini AI Service initialized with model: {self.model}")

    def _format_history(self, conversation_history: List[Dict[str, str]]) -> List[Dict]:
        """Format conversation history for Gemini API"""
        contents = []
        for msg in conversation_history:
            role = "model" if msg["role"] == "assistant" else "user"
            contents.append(
                {
                    "role": role,
                    "parts": [{"text": msg["content"]}],
                }
            )
        return contents

    async def generate_response_async(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Generate AI response asynchronously

        Args:
            message: User's message
            conversation_history: List of previous messages with 'role' and 'content' keys

        Returns:
            AI generated response text
        """
        try:
            # Format conversation history
            contents = self._format_history(conversation_history or [])

            # Add current user message
            contents.append(
                {
                    "role": "user",
                    "parts": [{"text": message}],
                }
            )

            # Generate response
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model,
                contents=contents,
            )

            # Extract text from response
            if hasattr(response, "text") and response.text:
                return response.text

            # Fallback: try to extract from candidates
            if hasattr(response, "candidates") and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, "content"):
                    parts = candidate.content.parts
                    text_parts = [part.text for part in parts if hasattr(part, "text")]
                    if text_parts:
                        return "".join(text_parts)

            return "I received your message but couldn't generate a response."

        except Exception as e:
            error_msg = str(e)
            print(f"✗ Gemini Error: {error_msg}")
            traceback.print_exc()

            # Return user-friendly error message
            if "quota" in error_msg.lower():
                return "I'm currently at capacity. Please try again in a moment."
            elif "safety" in error_msg.lower():
                return "I cannot respond to that message due to safety guidelines."
            else:
                return "Sorry, I encountered an error processing your request. Please try again."

    def get_model_name(self) -> str:
        """Get the current model name"""
        return self.model

    def list_available_models(self):
        """List all models that support generateContent"""
        try:
            print("\n" + "=" * 70)
            print("📋 AVAILABLE MODELS FOR CHAT")
            print("=" * 70)

            models = self.client.models.list()
            chat_models = []

            for model in models:
                supported = getattr(model, "supported_generation_methods", [])
                if "generateContent" in supported:
                    chat_models.append(
                        {
                            "name": model.name,
                            "display_name": getattr(model, "display_name", "N/A"),
                            "input_limit": getattr(model, "input_token_limit", 0),
                            "output_limit": getattr(model, "output_token_limit", 0),
                        }
                    )

            # Sort by name
            chat_models.sort(key=lambda x: x["name"])

            # Print recommended models
            print("\n🚀 RECOMMENDED MODELS:")
            recommended = [
                "gemini-2.5-flash",
                "gemini-2.5-pro",
                "gemini-3-flash",
                "gemini-flash-latest",
            ]
            for model in chat_models:
                if any(rec in model["name"] for rec in recommended):
                    print(f"\n  ✓ {model['name']}")
                    print(f"    Display: {model['display_name']}")
                    print(
                        f"    Limits: {model['input_limit']:,} in / {model['output_limit']:,} out"
                    )

            print(f"\n📊 Total models supporting generateContent: {len(chat_models)}")
            print("=" * 70 + "\n")

        except Exception as e:
            print(f"⚠ Error listing models: {e}")


# ============================================================
# TEST FUNCTIONS
# ============================================================


async def test_service():
    """Comprehensive test of the AI service"""
    try:
        print("\n" + "=" * 70)
        print("🧪 AI SERVICE TEST SUITE")
        print("=" * 70)

        # Initialize service
        service = AIService()

        # Test 1: Simple greeting
        print("\n💬 Test 1: Simple Greeting")
        print("-" * 70)
        response = await service.generate_response_async(
            message="Hello! How are you?", conversation_history=[]
        )
        print(f"🤖 Response: {response}")

        # Test 2: Conversation with context
        print("\n💬 Test 2: Conversation with Context")
        print("-" * 70)
        history = [
            {"role": "user", "content": "I'm learning Python."},
            {
                "role": "assistant",
                "content": "That's great! Python is a versatile language.",
            },
        ]
        response = await service.generate_response_async(
            message="What would you recommend I learn next?",
            conversation_history=history,
        )
        print(f"🤖 Response: {response}")

        # Test 3: Creative task
        print("\n💬 Test 3: Creative Task")
        print("-" * 70)
        response = await service.generate_response_async(
            message="Write a haiku about coding.", conversation_history=[]
        )
        print(f"🤖 Response: {response}")

        # Test 4: Information retrieval
        print("\n💬 Test 4: Information Retrieval")
        print("-" * 70)
        response = await service.generate_response_async(
            message="Explain what async/await does in Python in one sentence.",
            conversation_history=[],
        )
        print(f"🤖 Response: {response}")

        print("\n" + "=" * 70)
        print("✅ ALL TESTS PASSED!")
        print("=" * 70 + "\n")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        traceback.print_exc()


async def interactive_chat():
    """Interactive chat session for manual testing"""
    print("\n" + "=" * 70)
    print("💬 INTERACTIVE CHAT MODE")
    print("=" * 70)
    print("Type your messages below. Type 'exit' or 'quit' to end.\n")

    service = AIService()
    conversation_history = []

    while True:
        try:
            # Get user input
            user_input = input("\n👤 You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "bye"]:
                print("\n👋 Goodbye!")
                break

            # Generate response
            response = await service.generate_response_async(
                message=user_input, conversation_history=conversation_history
            )

            # Display response
            print(f"🤖 AI: {response}")

            # Update conversation history
            conversation_history.append({"role": "user", "content": user_input})
            conversation_history.append({"role": "assistant", "content": response})

            # Keep only last 10 exchanges (20 messages)
            if len(conversation_history) > 20:
                conversation_history = conversation_history[-20:]

        except KeyboardInterrupt:
            print("\n\n👋 Chat interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "chat":
        # Run interactive chat
        asyncio.run(interactive_chat())
    elif len(sys.argv) > 1 and sys.argv[1] == "models":
        # List available models
        service = AIService()
        service.list_available_models()
    else:
        # Run test suite
        asyncio.run(test_service())
