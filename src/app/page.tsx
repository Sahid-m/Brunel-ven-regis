import BAV from "@/components/BAV";

export default function Home() {
  const university = process.env.UNIVERSITY ?? "brunel";
  return <BAV university={university} />;
}
