import { RefinementCtx, ZodError, z } from "zod";

describe("Zod", () => {
  it("should support validation", () => {
    const schema = z.string().min(3).max(100);

    const request = "Otong";
    const result = schema.parse(request);

    expect(result).toBe("Otong");
  });

  it("should support validate primitive data type", () => {
    const usernameSchema = z.string().email();
    const isAdminSchema = z.boolean();
    const priceSchema = z.number().min(1000).max(1000000);

    const username = usernameSchema.parse("otong@gmail.com");
    console.info(username);

    const isAdmin = isAdminSchema.parse(true);
    console.info(isAdmin);

    const price = priceSchema.parse(20000);
    console.info(price);
  });

  it("should support data conversion", () => {
    const usernameSchema = z.coerce.string().min(3).max(100);
    const isAdminSchema = z.coerce.boolean();
    const priceSchema = z.coerce.number().min(1000).max(1000000);

    const username = usernameSchema.parse(123456);
    console.info(username);

    const isAdmin = isAdminSchema.parse("true");
    console.info(isAdmin);

    const price = priceSchema.parse("20000");
    console.info(price);
  });

  it("should support date validation", () => {
    const birthDateSchema = z.coerce
      .date()
      .min(new Date(1980, 0, 1))
      .max(new Date(2020, 0, 1));

    const birtDate = birthDateSchema.parse("1990-01-01");
    console.info(birtDate);

    const birtDate2 = birthDateSchema.parse(new Date(1990, 0, 1));
    console.info(birtDate2);
  });

  it("should return zod error if invalid", () => {
    const schema = z.string().email().min(3).max(100);

    try {
      schema.parse("ot");
    } catch (err) {
      if (err instanceof ZodError) {
        console.error(err);
        // err.errors.forEach((e) => {
        //   console.info(e.message);
        // });
      }
    }
  });

  it("should return zod error if invalid without exception", () => {
    const schema = z.string().email().min(3).max(100);

    const result = schema.safeParse("otong@gmail.com");

    if (result.success) {
      console.info(result.data);
    } else {
      console.error(result.error);
    }
  });

  it("should can validate object", () => {
    const loginSchema = z.object({
      username: z.string().email(),
      password: z.string().min(6).max(20),
    });

    const request = {
      username: "otong@gmail.com",
      password: "rahasia",
      ignore: "ignore",
      name: "Otong Surotong",
    };

    const result = loginSchema.parse(request);
    console.info(result);
  });

  it("should support nested object", () => {
    const createUserSchema = z.object({
      id: z.string().max(100),
      name: z.string().max(100),
      address: z.object({
        street: z.string().max(100),
        city: z.string().max(100),
        zip: z.string().max(10),
        country: z.string().max(100),
      }),
    });

    const request = {
      id: "1",
      name: "Otong",
      address: {
        street: "Jalan Lubang",
        city: "Otong City",
        zip: "1234",
        country: "Otong Country",
      },
    };

    const result = createUserSchema.parse(request);
    console.info(result);
  });

  it("should support array validation", () => {
    const schema = z.array(z.string().email()).min(1).max(10);

    const request: Array<string> = ["otong@gmail.com", "ucup@gmail.com"];
    const result: Array<string> = schema.parse(request);

    console.info(result);
  });

  it("should support set validation", () => {
    const schema = z.set(z.string().email()).min(1).max(10);

    const request: Set<string> = new Set([
      "otong@gmail.com",
      "ucup@gmail.com",
      "otong@gmail.com",
    ]);
    const result: Set<string> = schema.parse(request);

    console.info(result);
  });

  it("should support map validation", () => {
    const schema = z.map(z.string(), z.string().email());

    const request: Map<string, string> = new Map([
      ["otong", "otong@gmail.com"],
      ["ucup", "ucup@gmail.com"],
    ]);

    const result: Map<string, string> = schema.parse(request);
    console.info(result);
  });

  it("should can validate object with message", () => {
    const loginSchema = z.object({
      username: z.string().email("username harus email"),
      password: z
        .string()
        .min(6, "password min harus 6 karakter")
        .max(20, "password max harus 20 karakter"),
    });

    const request = {
      username: "otong",
      password: "123",
    };

    try {
      const result = loginSchema.parse(request);
      console.info(result);
    } catch (err) {
      console.error(err);
    }
  });

  it("should can support optinal validation", () => {
    const registerSchema = z.object({
      username: z.string().email(),
      password: z.string().min(6).max(20),
      firstName: z.string().min(3).max(100),
      lastName: z.string().min(3).max(100).optional(),
    });

    const request = {
      username: "eko@gmail.com",
      password: "rahasia",
      firstName: "Otong",
    };

    const result = registerSchema.parse(request);
    console.info(result);
  });

  it("should support transform", () => {
    const schema = z.string().transform((data) => data.toUpperCase().trim());

    const result = schema.parse("     otong      ");
    console.info(result);
  });

  function mustUpperCase(data: string, ctx: RefinementCtx): string {
    if (data != data.toUpperCase()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "username harus uppercase",
      });
      return z.NEVER;
    } else {
      return data;
    }
  }

  it("should can use custome validation", () => {
    const loginSchema = z.object({
      username: z.string().email().transform(mustUpperCase),
      password: z.string().min(6).max(100),
    });

    const request = {
      username: "OTONG@GMAIL.COM",
      password: "rahasia",
    };

    const result = loginSchema.parse(request);
    console.info(result);
  });
});
