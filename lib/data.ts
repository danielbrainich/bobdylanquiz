export const DATA = [
  { character: "Miss Lonely", song: "Like a Rolling Stone", paraphrase: "Once lived fine and easy — now she's scrambling on the street with nothing left." },
  { character: "Napoleon in Rags", song: "Like a Rolling Stone", paraphrase: "A once-grand figure reduced to shabby, desperate circumstances." },
  { character: "The Diplomat", song: "Like a Rolling Stone", paraphrase: "Rides in on a fancy horse with a Siamese cat perched on his shoulder." },
  { character: "Mr. Jones", song: "Ballad of a Thin Man", paraphrase: "An outsider totally baffled by the strange scene unfolding around him." },
  { character: "Cinderella", song: "Desolation Row", paraphrase: "Seen sweeping up, playing respectable among a much rougher crowd." },
  { character: "Romeo", song: "Desolation Row", paraphrase: "Complains he's already lived through this exact heartbreak before." },
  { character: "Casanova", song: "Desolation Row", paraphrase: "Publicly humiliated and taught a harsh lesson in humility." },
  { character: "Ophelia", song: "Desolation Row", paraphrase: "Obsessed with a rainbow, terrified of the world just outside her door." },
  { character: "Dr. Filth", song: "Desolation Row", paraphrase: "Runs a bizarre practice with a strange cabinet and an overly devoted nurse." },
  { character: "Einstein (as Robin Hood)", song: "Desolation Row", paraphrase: "Wanders around sniffing drainpipes and reciting the alphabet." },
  { character: "The Hunchback of Notre Dame", song: "Desolation Row", paraphrase: "Keeps to himself, staying well clear of the window." },
  { character: "Phantom of the Opera", song: "Desolation Row", paraphrase: "Regarded by the neighborhood as the very picture of piety." },
  { character: "Ezra Pound & T.S. Eliot", song: "Desolation Row", paraphrase: "Brawling with each other in the lookout of a ship named for the Titanic." },
  { character: "The Good Samaritan", song: "Desolation Row", paraphrase: "Getting dressed up like he's headed for a performance, not a rescue." },
  { character: "Louise", song: "Visions of Johanna", paraphrase: "Physically present in the room, quietly holding the scene together." },
  { character: "Little Boy Lost", song: "Visions of Johanna", paraphrase: "A grieving figure trying hard to carry himself like a grown man." },
  { character: "Patty Valentine", song: "Hurricane", paraphrase: "A witness whose account becomes central to the whole case." },
  { character: "Big Jim", song: "Lily, Rosemary and the Jack of Hearts", paraphrase: "The wealthy man everyone in town seems to revolve around." },
  { character: "Georgia Sam", song: "Highway 61 Revisited", paraphrase: "Shows up broke and homeless, told to just try the highway." },
  { character: "Mack the Finger", song: "Highway 61 Revisited", paraphrase: "Has a pile of unwanted goods and no idea where to dump them." },
  { character: "Louie the King", song: "Highway 61 Revisited", paraphrase: "Asked to stage a whole new world war, on the cheap." },
  { character: "Abraham", song: "Highway 61 Revisited", paraphrase: "Told by God to sacrifice his son, questions it, gets pointed to the highway." },
  { character: "William Zantzinger", song: "The Lonesome Death of Hattie Carroll", paraphrase: "The wealthy assailant handed a shockingly light sentence." },
  { character: "Genghis Khan and his brother Don", song: "You Ain't Goin' Nowhere", paraphrase: "Couldn't manage to keep on keepin' on, of all people." },
  { character: "Sue", song: "You Ain't Goin' Nowhere", paraphrase: "Told to grab her hat — the cat needs feeding and she's the one to do it." },
  { character: "Sweet Melinda", song: "Just Like Tom Thumb's Blues", paraphrase: "Called the goddess of gloom by the locals — inviting, but dangerous to visit too soon." },
  { character: "Saint Annie", song: "Just Like Tom Thumb's Blues", paraphrase: "A figure the narrator asks to be thanked, from somewhere far away." },
] as const;

export type QuizEntry = (typeof DATA)[number];

export const ALL_SONGS = [...new Set(DATA.map((d) => d.song))];
