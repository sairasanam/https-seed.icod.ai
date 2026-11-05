import { Card } from '@/components/ui';
import { buttonClass } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { Organization } from '../types';
import { Heart, Star, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

interface OrganizationCardProps {
  organization: Organization;
  onToggleFollow?: (organization: Organization) => void;
  onToggleFavorite?: (organization: Organization) => void;
  onClick?: (organization: Organization) => void;
  className?: string;
}

const typeIcons: Record<string, string> = {
  nonprofit: 'bg-primary/10 text-primary',
  church: 'bg-accent/20 text-accent-foreground',
  environmental: 'bg-success/10 text-success',
  community: 'bg-secondary text-secondary-foreground',
  cause: 'bg-warning/10 text-warning',
  other: 'bg-muted text-muted-foreground',
};

export default function OrganizationCard({
  organization,
  onToggleFollow,
  onToggleFavorite,
  onClick,
  className,
}: OrganizationCardProps) {
  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.98]',
        className
      )}
      onClick={() => onClick?.(organization)}
      data-icod-id="src_components_organizationcard_tsx_3086">
      <div
        className="flex items-start justify-between"
        data-icod-id="src_components_organizationcard_tsx_c5b7">
        <div
          className="flex-1 min-w-0"
          data-icod-id="src_components_organizationcard_tsx_535a">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_components_organizationcard_tsx_48a1">
            <h3
              className="font-semibold text-foreground truncate"
              data-icod-id="src_components_organizationcard_tsx_be94">{organization.name}</h3>
            {organization.verified && (
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-primary"
                data-icod-id="src_components_organizationcard_tsx_030f" />
            )}
            <span
              className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs capitalize', typeIcons[organization.type] || typeIcons.other)}
              data-icod-id="src_components_organizationcard_tsx_d6ae">
              {organization.type}
            </span>
          </div>
          {organization.description && (
            <p
              className="mt-1 text-sm text-muted-foreground line-clamp-2"
              data-icod-id="src_components_organizationcard_tsx_1cfa">{organization.description}</p>
          )}
        </div>
        <div
          className="flex shrink-0 flex-col gap-1 ml-2"
          data-icod-id="src_components_organizationcard_tsx_86a5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow?.(organization);
            }}
            className={cn('p-1.5 rounded-full transition-colors', organization.followed ? 'text-primary' : 'text-muted-foreground hover:text-primary')}
            aria-label={organization.followed ? 'Unfollow' : 'Follow'}
            data-icod-id="src_components_organizationcard_tsx_8c60">
            <Heart
              className={cn('h-4 w-4', organization.followed && 'fill-current')}
              data-icod-id="src_components_organizationcard_tsx_15d5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(organization);
            }}
            className={cn('p-1.5 rounded-full transition-colors', organization.favorites ? 'text-warning' : 'text-muted-foreground hover:text-warning')}
            aria-label={organization.favorites ? 'Unfavorite' : 'Favorite'}
            data-icod-id="src_components_organizationcard_tsx_964f">
            <Star
              className={cn('h-4 w-4', organization.favorites && 'fill-current')}
              data-icod-id="src_components_organizationcard_tsx_afcc" />
          </button>
        </div>
      </div>
      {organization.opportunities.length > 0 && (
        <div className="mt-3" data-icod-id="src_components_organizationcard_tsx_c6ce">
          <p
            className="text-xs font-medium text-muted-foreground"
            data-icod-id="src_components_organizationcard_tsx_a30c">Opportunities:</p>
          <p
            className="text-sm text-foreground"
            data-icod-id="src_components_organizationcard_tsx_a77b">{organization.opportunities[0]}</p>
          {organization.opportunities.length > 1 && (
            <p
              className="text-xs text-muted-foreground"
              data-icod-id="src_components_organizationcard_tsx_f926">+{organization.opportunities.length - 1} more</p>
          )}
        </div>
      )}
      <div
        className="mt-3 flex gap-2"
        data-icod-id="src_components_organizationcard_tsx_44d1">
        {organization.website && (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={buttonClass({ variant: 'outline', size: 'sm', className: 'gap-1' })}
            data-icod-id="src_components_organizationcard_tsx_1bd0">
            <Globe
              className="h-3 w-3"
              data-icod-id="src_components_organizationcard_tsx_e529" />
            Website
          </a>
        )}
        {(organization.donationUrl || organization.donationLink) && (
          <a
            href={organization.donationUrl || organization.donationLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={buttonClass({ variant: 'primary', size: 'sm', className: 'gap-1' })}
            data-icod-id="src_components_organizationcard_tsx_e04e">
            <ExternalLink
              className="h-3 w-3"
              data-icod-id="src_components_organizationcard_tsx_ecbb" />
            Donate
          </a>
        )}
      </div>
    </Card>
  );
}
