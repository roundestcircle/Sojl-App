import { parseGpxWaypoints } from "@/lib/io/gpx";

const gpx = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="test" xmlns="http://www.topografix.com/GPX/1/1">
${body}
</gpx>`;

describe("parseGpxWaypoints", () => {
  it("reads lat, lon and name of normal waypoints", () => {
    const xml = gpx(`
      <wpt lat="51.5300" lon="9.9300"><ele>150</ele><name>P1</name></wpt>
      <wpt lon="9.94" lat="51.54"><name>  P2  </name></wpt>`);
    expect(parseGpxWaypoints(xml)).toEqual([
      { lat: 51.53, lon: 9.93, name: "P1" },
      { lat: 51.54, lon: 9.94, name: "P2" },
    ]);
  });

  it("supports self-closing waypoints and single-quoted attributes", () => {
    const xml = gpx(`<wpt lat='51.5' lon='9.9'/>`);
    expect(parseGpxWaypoints(xml)).toEqual([{ lat: 51.5, lon: 9.9 }]);
  });

  it("omits empty names", () => {
    const xml = gpx(`<wpt lat="51.5" lon="9.9"><name>   </name></wpt>`);
    expect(parseGpxWaypoints(xml)).toEqual([{ lat: 51.5, lon: 9.9 }]);
  });

  it("decodes XML entities in names", () => {
    const xml = gpx(
      `<wpt lat="1" lon="2"><name>A &amp; B &lt;3&gt; &quot;x&quot; &apos;y&apos;</name></wpt>`,
    );
    expect(parseGpxWaypoints(xml)[0].name).toBe(`A & B <3> "x" 'y'`);
  });

  it("decodes &amp; last so escaped entities stay literal", () => {
    const xml = gpx(`<wpt lat="1" lon="2"><name>&amp;lt;</name></wpt>`);
    expect(parseGpxWaypoints(xml)[0].name).toBe("&lt;");
  });

  it("skips waypoints with missing or non-numeric coordinates", () => {
    const xml = gpx(`
      <wpt lat="51.5"><name>no lon</name></wpt>
      <wpt lat="abc" lon="9.9"><name>bad lat</name></wpt>
      <wpt lat="51.6" lon="9.8"><name>ok</name></wpt>`);
    expect(parseGpxWaypoints(xml)).toEqual([
      { lat: 51.6, lon: 9.8, name: "ok" },
    ]);
  });

  it("ignores routes and tracks", () => {
    const xml = gpx(`
      <rte><rtept lat="1" lon="1"><name>R</name></rtept></rte>
      <trk><trkseg><trkpt lat="2" lon="2"/></trkseg></trk>`);
    expect(parseGpxWaypoints(xml)).toEqual([]);
  });

  it("returns an empty list for non-GPX input", () => {
    expect(parseGpxWaypoints("not xml at all")).toEqual([]);
  });
});
