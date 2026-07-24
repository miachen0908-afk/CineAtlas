import { PeopleTimeline } from "@/components/timeline/PeopleTimeline";

export default function PeoplePage() {
  return (
    <div className="starfield-bg flex-1 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-light text-[#e8d5a3] md:text-3xl">
            影人长廊
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Explore Cinema Across Time and Place
          </p>
        </header>
        <PeopleTimeline />
      </div>
    </div>
  );
}
