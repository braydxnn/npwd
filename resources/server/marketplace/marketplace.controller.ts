import {
  MarketplaceEvents,
  MarketplaceListing,
  MarketplaceListingBase,
  MarketplaceReportDTO,
} from '../../../typings/marketplace';
import { marketplaceLogger } from './marketplace.utils';
import MarketplaceService from './marketplace.service';
import { onNetPromise } from '../utils/PromiseNetEvents/onNetPromise';
import { MarketplaceDeleteDTO } from '../../../typings/marketplace';

onNetPromise<void, MarketplaceListing[]>(MarketplaceEvents.FETCH_LISTING, async (reqObj, resp) => {
  MarketplaceService.handleFetchListings(reqObj, resp).catch((e) => {
    marketplaceLogger.error(
      `Error occurred in fetch listing event (${reqObj.source}), Error: ${e.message}`,
    );
    resp({ status: 'error', errorMsg: 'INTERNAL_ERROR' });
  });
});

onNetPromise<MarketplaceListingBase, void>(MarketplaceEvents.ADD_LISTING, async (reqObj, resp) => {
  MarketplaceService.handleAddListing(reqObj, resp).catch((e) => {
    marketplaceLogger.error(
      `Error occurred in add listing event (${reqObj.source}), Error: ${e.message}`,
    );
    resp({ status: 'error', errorMsg: 'INTERNAL_ERROR' });
  });
});

onNetPromise<MarketplaceDeleteDTO>(MarketplaceEvents.DELETE_LISTING, async (reqObj, resp) => {
  // TODO: Needs a permission check of some sort here eventually
  MarketplaceService.handleDeleteListing(reqObj, resp).catch((e) => {
    marketplaceLogger.error(
      `Error occurred in delete listing event (${reqObj.source}), Error: ${e.message}`,
    );
    resp({ status: 'error', errorMsg: 'INTERNAL_ERROR' });
  });
});

onNetPromise<MarketplaceReportDTO>(MarketplaceEvents.REPORT_LISTING, async (reqObj, resp) => {
  // TODO: Needs a permission check of some sort here eventually
  MarketplaceService.handleReportListing(reqObj, resp).catch((e) => {
    marketplaceLogger.error(
      `Error occurred in report listing event (${reqObj.source}), Error: ${e.message}`,
    );
    resp({ status: 'error', errorMsg: 'INTERNAL_ERROR' });
  });
});
