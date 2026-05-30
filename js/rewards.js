import { Store } from "./state.js";
import { Sound } from "./audio.js";
import { toast } from "./ui.js";
import { refreshCoins } from "./main.js";

// Award coins, animate the counter, and nudge toward the sticker shop.
export function award(n, msg) {
  if (n <= 0) return;
  Store.addCoins(n);
  Sound.coin();
  refreshCoins();
  if (msg) toast(msg);
}
