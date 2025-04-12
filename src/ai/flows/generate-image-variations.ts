// src/ai/flows/generate-image-variations.ts
'use server';

/**
 * @fileOverview Image variation generator flow.
 *
 * This file defines a Genkit flow that takes an image URL as input and generates variations of the image using a generative AI model.
 *
 * @module ai/flows/generate-image-variations
 *
 * @interface GenerateImageVariationsInput - The input type for the generateImageVariations function.
 * @interface GenerateImageVariationsOutput - The output type for the generateImageVariations function, which is an array of image URLs.
 * @function generateImageVariations - The main function to generate image variations.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateImageVariationsInputSchema = z.object({
  imageUrl: z.string().describe('The URL of the image to generate variations from.'),
  numberOfVariations: z
    .number()
    .min(1)
    .max(5)
    .default(3)
    .describe('The number of image variations to generate.'),
});

export type GenerateImageVariationsInput = z.infer<
  typeof GenerateImageVariationsInputSchema
>;

const GenerateImageVariationsOutputSchema = z.array(z.string().url());

export type GenerateImageVariationsOutput = z.infer<
  typeof GenerateImageVariationsOutputSchema
>;

export async function generateImageVariations(
  input: GenerateImageVariationsInput
): Promise<GenerateImageVariationsOutput> {
  return generateImageVariationsFlow(input);
}

const generateImageVariationsPrompt = ai.definePrompt({
  name: 'generateImageVariationsPrompt',
  input: {
    schema: z.object({
      imageUrl: z.string().describe('The URL of the image to generate variations from.'),
      numberOfVariations: z
        .number()
        .min(1)
        .max(5)
        .default(3)
        .describe('The number of image variations to generate.'),
    }),
  },
  output: {
    schema: z.array(z.string().url()).describe('An array of image URLs that are variations of the original image.'),
  },
  prompt: `You are an AI that generates creative variations of a given image.

  Given the URL of an image, generate creative and visually appealing variations of the image.
  Return a JSON array of image URLs.

  Number of variations to generate: {{numberOfVariations}}
  Image URL: {{imageUrl}}

  Ensure that the generated variations are creative and different from the original image, while still maintaining a visual relationship.
  `,
});

const generateImageVariationsFlow = ai.defineFlow<
  typeof GenerateImageVariationsInputSchema,
  typeof GenerateImageVariationsOutputSchema
>({
  name: 'generateImageVariationsFlow',
  inputSchema: GenerateImageVariationsInputSchema,
  outputSchema: GenerateImageVariationsOutputSchema,
},
async input => {
  const {output} = await generateImageVariationsPrompt(input);
  return output!;
});
