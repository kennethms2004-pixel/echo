const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!clerkIssuerDomain) {
  throw new Error(
    "Missing CLERK_JWT_ISSUER_DOMAIN. Set it before loading Convex auth config."
  );
}

export default {
  providers: [
    {
      domain: clerkIssuerDomain,
      applicationID: "convex"
    }
  ]
};
