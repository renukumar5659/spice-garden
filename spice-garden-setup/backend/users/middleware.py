from django.http import JsonResponse


class GoogleCORSMiddleware:
    """
    CORS middleware for the Spice Garden frontend.

    Handles:
    - OPTIONS preflight requests
    - Normal requests from the production frontend
    """

    FRONTEND_ORIGIN = "https://spice-garden-jl9d.onrender.com"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        origin = request.headers.get("Origin")

        # ========================================================
        # OPTIONS / PREFLIGHT REQUEST
        # ========================================================

        if request.method == "OPTIONS":

            response = JsonResponse(
                {"detail": "CORS preflight OK"},
                status=200,
            )

            if origin == self.FRONTEND_ORIGIN:

                response["Access-Control-Allow-Origin"] = origin

                response["Access-Control-Allow-Credentials"] = "true"

                response["Access-Control-Allow-Methods"] = (
                    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                )

                response["Access-Control-Allow-Headers"] = (
                    "Accept, "
                    "Accept-Encoding, "
                    "Authorization, "
                    "Content-Type, "
                    "DNT, "
                    "Origin, "
                    "User-Agent, "
                    "X-Requested-With, "
                    "X-CSRFToken"
                )

                response["Access-Control-Max-Age"] = "86400"

                response["Vary"] = "Origin"

            return response

        # ========================================================
        # NORMAL REQUEST
        # ========================================================

        response = self.get_response(request)

        if origin == self.FRONTEND_ORIGIN:

            response["Access-Control-Allow-Origin"] = origin

            response["Access-Control-Allow-Credentials"] = "true"

            response["Vary"] = "Origin"

        return response