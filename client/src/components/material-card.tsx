import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Material } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface MaterialCardProps {
  material: Material;
}

export default function MaterialCard({ material }: MaterialCardProps) {
  const handleView = () => {
    if (material.type === "video" && material.url.includes("youtube")) {
      window.open(material.url, "_blank");
    } else {
      window.open(material.url, "_blank");
    }
  };

  const getTypeIcon = () => {
    switch (material.type) {
      case "whiteboard": return "fas fa-chalkboard";
      case "video": return "fas fa-play-circle";
      default: return "fas fa-file";
    }
  };

  const getTypeColor = () => {
    switch (material.type) {
      case "whiteboard": return "bg-blue-500/10 text-blue-500";
      case "video": return "bg-red-500/10 text-red-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const timeAgo = material.createdAt 
    ? formatDistanceToNow(new Date(material.createdAt), { addSuffix: true, locale: ar })
    : "";

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" data-testid={`card-material-${material.id}`}>
      <CardContent className="p-4">
        {material.type === "whiteboard" && (
          <img 
            src="https://images.unsplash.com/photo-1635372722656-389f87a941b7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
            alt="Whiteboard with mathematical equations"
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        {material.type === "video" && (
          <div className="relative mb-4">
            <img 
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=225"
              alt="Arabic teacher explaining mathematical concepts"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center">
                <i className="fas fa-play text-lg"></i>
              </div>
            </div>
          </div>
        )}
        
        <h3 className="font-bold text-foreground mb-2" data-testid={`text-material-title-${material.id}`}>
          {material.title}
        </h3>
        
        {material.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {material.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <Badge className={getTypeColor()}>
            <i className={`${getTypeIcon()} ml-1`}></i>
            {material.subject}
          </Badge>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{timeAgo}</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleView}
              data-testid={`button-view-material-${material.id}`}
            >
              <i className="fas fa-external-link-alt ml-1"></i>
              عرض
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
