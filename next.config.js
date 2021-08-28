const withPWA = require("next-pwa");

module.exports = withPWA({
    pwa: {
        dest: "public"
    },
    future: {
        webpack5: true
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Permissions-Policy",
                        value: "interest-cohort=()"
                    }
                ]
            }
        ]
    }
});
