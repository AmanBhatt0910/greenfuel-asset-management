export async function POST() {
  return new Response(
    JSON.stringify({ message: "Logged out" }),
    {
      status: 200,
      headers: {
        "Set-Cookie": `
          token=;
          Path=/;
          Max-Age=0;
          HttpOnly;
          SameSite=Strict;
        `.replace(/\s+/g, " "),
      },
    }
  );
}
