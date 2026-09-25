from django.http import JsonResponse


class GoogleCORSMiddleware:
    """
    Explicit CORS handler for the Spice Garden production frontend.

    Handles OPTIONS preflight requests and adds CORS headers
    to normal API responses.
    """

    FRONTEND_ORIGIN = "https://spice-garden-jl9d.onrender.com"

    ALLOWED_METHODS = (
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    )

    ALLOWED_HEADERS = (
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

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        origin = request.headers.get("Origin")

        # ========================================================
        # CORS PREFLIGHT
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
                    self.ALLOWED_METHODS
                )

                response["Access-Control-Allow-Headers"] = (
                    self.ALLOWED_HEADERS
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