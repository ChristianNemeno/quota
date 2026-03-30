import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env["DATABASE_URL"];

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

const quotes = [
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    tags: ["stoicism", "wisdom"],
  },
  {
    text: "He who fears death will never do anything worthy of a man who is alive.",
    author: "Seneca",
    tags: ["stoicism", "philosophy"],
  },
  {
    text: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    tags: ["stoicism", "wisdom", "motivation"],
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius",
    tags: ["stoicism", "wisdom"],
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus",
    tags: ["stoicism", "philosophy", "motivation"],
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus",
    tags: ["stoicism", "motivation"],
  },
  {
    text: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    tags: ["philosophy", "wisdom"],
  },
  {
    text: "The unexamined life is not worth living.",
    author: "Socrates",
    tags: ["philosophy", "wisdom"],
  },
  {
    text: "Wonder is the beginning of wisdom.",
    author: "Socrates",
    tags: ["philosophy", "wisdom"],
  },
  {
    text: "Life must be understood backward. But it must be lived forward.",
    author: "Soren Kierkegaard",
    tags: ["philosophy", "wisdom"],
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    tags: ["motivation", "wisdom"],
  },
  {
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
    tags: ["motivation", "philosophy"],
  },
  {
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    tags: ["motivation", "wisdom"],
  },
  {
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    tags: ["motivation", "wisdom"],
  },
  {
    text: "Creativity is intelligence having fun.",
    author: "Albert Einstein",
    tags: ["creativity", "science", "humor"],
  },
  {
    text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
    author: "Albert Einstein",
    tags: ["science", "humor", "wisdom"],
  },
  {
    text: "The important thing is not to stop questioning.",
    author: "Albert Einstein",
    tags: ["science", "wisdom"],
  },
  {
    text: "Somewhere, something incredible is waiting to be known.",
    author: "Carl Sagan",
    tags: ["science", "wisdom"],
  },
  {
    text: "Science is a way of thinking much more than it is a body of knowledge.",
    author: "Carl Sagan",
    tags: ["science", "philosophy"],
  },
  {
    text: "If I have seen further it is by standing on the shoulders of giants.",
    author: "Isaac Newton",
    tags: ["science", "wisdom"],
  },
  {
    text: "I can resist everything except temptation.",
    author: "Oscar Wilde",
    tags: ["humor", "literature"],
  },
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    tags: ["humor", "wisdom", "literature"],
  },
  {
    text: "Get your facts first, then you can distort them as you please.",
    author: "Mark Twain",
    tags: ["humor", "literature", "wisdom"],
  },
  {
    text: "The secret source of humor itself is not joy but sorrow.",
    author: "Mark Twain",
    tags: ["humor", "literature"],
  },
  {
    text: "There is no greater agony than bearing an untold story inside you.",
    author: "Maya Angelou",
    tags: ["literature", "creativity", "wisdom"],
  },
  {
    text: "You can make anything by writing.",
    author: "C. S. Lewis",
    tags: ["literature", "creativity"],
  },
  {
    text: "A word after a word after a word is power.",
    author: "Margaret Atwood",
    tags: ["literature", "creativity", "wisdom"],
  },
  {
    text: "You can't use up creativity. The more you use, the more you have.",
    author: "Maya Angelou",
    tags: ["creativity", "motivation"],
  },
  {
    text: "To live a creative life, we must lose our fear of being wrong.",
    author: "Joseph Chilton Pearce",
    tags: ["creativity", "motivation"],
  },
  {
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    tags: ["wisdom", "philosophy"],
  },
] as const;

async function main() {
  await prisma.tagsOnQuotes.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.tag.deleteMany();

  for (const quote of quotes) {
    await prisma.quote.create({
      data: {
        text: quote.text,
        author: quote.author,
        tags: {
          create: quote.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name },
              },
            },
          })),
        },
      },
    });
  }

  console.log("Seeded", quotes.length, "quotes");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
