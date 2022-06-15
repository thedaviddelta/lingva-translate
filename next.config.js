const withPWA = require("next-pwa");

module.exports = withPWA({
    swcMinify: true,
    pwa: {
        dest: "public"
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
