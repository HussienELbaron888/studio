// src/ai/flows/content-tagging.ts
'use server';

/**
 * @fileOverview A content tagging AI agent.
 *
 * - contentTagging - A function that suggests tags for content based on its description.
 * - ContentTaggingInput - The input type for the contentTagging function.
 * - ContentTaggingOutput - The return type for the contentTagging function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentTaggingInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the content to be tagged.'),
});
export type ContentTaggingInput = z.infer<typeof ContentTaggingInputSchema>;

const ContentTaggingOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of suggested tags for the content.'),
});
export type ContentTaggingOutput = z.infer<typeof ContentTaggingOutputSchema>;

export async function contentTagging(input: ContentTaggingInput): Promise<ContentTaggingOutput> {
  return contentTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentTaggingPrompt',
  input: {schema: ContentTaggingInputSchema},
  output: {schema: ContentTaggingOutputSchema},
  prompt: `You are a content tagging expert. Given the following content description, suggest relevant tags.

Description: {{{description}}}

Tags:`,
});

const contentTaggingFlow = ai.defineFlow(
  {
    name: 'contentTaggingFlow',
    inputSchema: ContentTaggingInputSchema,
    outputSchema: ContentTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
