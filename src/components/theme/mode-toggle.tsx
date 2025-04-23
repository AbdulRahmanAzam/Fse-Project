import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme">
      {theme === 'dark' ? (<Sun className="h-5 w-5" />) : (<Moon className="h-5 w-5" />)}
    </Button>
  )
}
