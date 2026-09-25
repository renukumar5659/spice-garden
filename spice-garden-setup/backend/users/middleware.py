from django.http import JsonResponse


class GoogleCORSMiddleware:
    """
    Explicit CORS handler for the production frontend.

    This is a fallback for the Google login endpoint when the
    normal django-cors-headers configuration does not add the
    required headers to the preflight request.
    """

    FRONTEND_ORIGIN = "https://spice-garden-jl9d.onrender.com"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        origin = request.headers.get("Origin")

        # ---------------------------------------------------------
        # Handle CORS preflight OPTIONS request
        # ---------------------------------------------------------
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
                    "X-Requested-With"
                )
                response["Access-Control-Max-Age"] = "86400"

            return response

        # ---------------------------------------------------------
        # Normal request
        # ---------------------------------------------------------
        response = self.get_response(request)

        # Add CORS headers to production frontend
        if origin == self.FRONTEND_ORIGIN:
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Credentials"] = "true"
            response["Vary"] = "Origin"

        return response