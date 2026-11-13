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
  it("unwraps CDATA names and keeps their content literal", () => {
    const xml = gpx(
      `<wpt lat="1" lon="2"><name><![CDATA[A & B <x> &amp;]]></name></wpt>`,
    );
    expect(parseGpxWaypoints(xml)[0].name).toBe("A & B <x> &amp;");
  });

  it("decodes numeric character references", () => {
    const xml = gpx(
      `<wpt lat="1" lon="2"><name>M&#252;hle &#xFC;ber &#x1F600;</name></wpt>`,
    );
    expect(parseGpxWaypoints(xml)[0].name).toBe("Mühle über 😀");
  });

  it("ignores commented-out waypoints and comments inside names", () => {
    const xml = gpx(`
      <!-- <wpt lat="5" lon="5"><name>alt</name></wpt> -->
      <wpt lat="1" lon="2"><name>P<!-- x -->1</name></wpt>`);
    expect(parseGpxWaypoints(xml)).toEqual([{ lat: 1, lon: 2, name: "P1" }]);
  });

  it("accepts namespace-prefixed tags", () => {
    const xml = `<gpx:gpx xmlns:gpx="http://www.topografix.com/GPX/1/1">
      <gpx:wpt lat="51.5" lon="9.9"><gpx:name>NS</gpx:name></gpx:wpt>
      <gpx:wpt lat="51.6" lon="9.8"/>
    </gpx:gpx>`;
    expect(parseGpxWaypoints(xml)).toEqual([
      { lat: 51.5, lon: 9.9, name: "NS" },
      { lat: 51.6, lon: 9.8 },
    ]);
  });

  it("does not take the name of a following waypoint", () => {
    const xml = gpx(`
      <wpt lat="1" lon="2"></wpt>
      <wpt lat="3" lon="4"><name>B</name></wpt>`);
    expect(parseGpxWaypoints(xml)).toEqual([
      { lat: 1, lon: 2 },
      { lat: 3, lon: 4, name: "B" },
    ]);
  });

  it("skips waypoints outside the UTM range", () => {
    const xml = gpx(`
      <wpt lat="91" lon="9"/>
      <wpt lat="51" lon="181"/>
      <wpt lat="85" lon="9"/>
      <wpt lat="-81" lon="9"/>
      <wpt lat="84" lon="-180"/>
      <wpt lat="-80" lon="180"/>`);
    expect(parseGpxWaypoints(xml)).toEqual([
      { lat: 84, lon: -180 },
      { lat: -80, lon: 180 },
    ]);
  });
});
