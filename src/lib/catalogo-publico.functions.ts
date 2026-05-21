import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { fetchCatalogoPublicoBySlug } from "./catalogo-publico.server";

const catalogoInputSchema = z.object({
  slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export const getCatalogoPublico = createServerFn({ method: "GET" })
  .inputValidator((input) => catalogoInputSchema.parse(input))
  .handler(async ({ data }) => fetchCatalogoPublicoBySlug(data.slug));