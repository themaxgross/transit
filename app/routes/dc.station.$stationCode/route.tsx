import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { AIMPredictionTrainInfo, Station } from "~/types/dc";
import { useLoaderData } from "@remix-run/react";
import NextTrainInfo from "./NextTrainInfo";
import { StationInfo } from "./StationInfo";

export const loader: LoaderFunction = async ({ params }) => {
  const stationInfoResponse = await fetch(
    `https://api.wmata.com/Rail.svc/json/jStationInfo?StationCode=${params.stationCode}`,
    {
      headers: {
        api_key: process.env.WMATA_API_KEY ?? "",
      },
    }
  );
  const stationInfo = await stationInfoResponse.json();

  const nextTrainResponse = await fetch(
    `https://api.wmata.com/StationPrediction.svc/json/GetPrediction/${params.stationCode}`,
    {
      headers: {
        api_key: process.env.WMATA_API_KEY ?? "",
      },
    }
  );
  const nextTrain = await nextTrainResponse.json();

  return json(
    {
      station: stationInfo,
      nextTrain: nextTrain,
    },
    {
      headers: {
        "cache-control": "max-age=3600",
      },
    }
  );
};

export default function StationCode() {
  const { station, nextTrain } = useLoaderData<{
    station: Station;
    nextTrain: { Trains: AIMPredictionTrainInfo[] };
  }>();

  return (
    <>
      <StationInfo station={station} />
      <div className="flex flex-col w-full">
        {nextTrain.Trains.map((train) => {
          const key = `${train.DestinationName}-${train.Line}-${train.Min}`;

          return <NextTrainInfo predictionInfo={train} key={key} />;
        })}
      </div>
    </>
  );
}