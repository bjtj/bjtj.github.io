import { useCallback, useEffect, useState, HTMLAttributes, useRef } from "react";
import ErrorPanel from "../components/ErrorPanel";
import Input from "../components/Input";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Table from "../components/Table";

const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const WEEKDAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

export default function Datetime() {

  const [now, setNow] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(new Date().getTime().toString());
  const [error, setError] = useState<string>();
  const [date, setDate] = useState<Date>();

  const convert = useCallback(() => {
    if (time) {
      try {
        setDate(new Date(parseInt(time)));
      } catch (err) {
        setError(`${err}`);
      }
    }
  }, [time]);

  function offset(o: number) {
    let t = parseInt(time);
    if (isNaN(t)) {
      t = 0
    }
    setTime(`${Math.max(0, t + o)}`);
  }

  useEffect(() => {
    let timeout = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => {
      clearInterval(timeout);
    }
  }, []);

  useEffect(() => {
    convert();
  }, [time, convert]);

  return (
    <div>
      <h1>Datetime</h1>
      <p className="my-1">Current Time: <code className="select-none p-1" onClick={() => setTime(`${now.getTime()}`)}>{now.getTime()}</code> (<DateView date={now} />)</p>
      <div>
        <div className="flex flex-wrap items-center gap-1 my-3">
          <Input className="w-[12rem]" type="number" value={time} min={0} onChange={e => {
            if (e.target.value === '') {
              setTime('');
              return;
            }
            let ret = parseInt(e.target.value);
            if (isNaN(ret)) {
              if (!time) {
                setTime('0')
              }
            } else {
              setTime(e.target.value);
            }
          }} placeholder="Time in milliseconds..."
            inputMode="numeric" pattern="\d*" />
          {date && <DateView className="shrink-0" date={date} />}
        </div>

        <div className="flex items-center gap-1 overflow-auto">
          <Button variant="sm" onClick={() => offset(SEC)}><Icon className="!text-sm">add</Icon> 1sec.</Button>
          <Button variant="sm" onClick={() => offset(MIN)}><Icon className="!text-sm">add</Icon> 1min.</Button>
          <Button variant="sm" onClick={() => offset(HOUR)}><Icon className="!text-sm">add</Icon> 1hour</Button>
          <Button variant="sm" onClick={() => offset(12 * HOUR)}><Icon className="!text-sm">add</Icon> 12hours</Button>
          <Button variant="sm" onClick={() => offset(DAY)}><Icon className="!text-sm">add</Icon> 1day</Button>
          <Button variant="sm" onClick={() => offset(7 * DAY)}><Icon className="!text-sm">add</Icon> 7days</Button>
          <Button variant="sm" onClick={() => offset(30 * DAY)}><Icon className="!text-sm">add</Icon> 30days</Button>
          <Button variant="sm" onClick={() => offset(365 * DAY)}><Icon className="!text-sm">add</Icon> 365days</Button>
        </div>
        <div className="flex items-center gap-1 overflow-auto">
          <Button variant="sm" onClick={() => offset(-SEC)}><Icon className="!text-sm">remove</Icon> 1sec.</Button>
          <Button variant="sm" onClick={() => offset(-MIN)}><Icon className="!text-sm">remove</Icon> 1min.</Button>
          <Button variant="sm" onClick={() => offset(-HOUR)}><Icon className="!text-sm">remove</Icon> 1hour</Button>
          <Button variant="sm" onClick={() => offset(-12 * HOUR)}><Icon className="!text-sm">remove</Icon> 12hours</Button>
          <Button variant="sm" onClick={() => offset(-DAY)}><Icon className="!text-sm">remove</Icon> 1day</Button>
          <Button variant="sm" onClick={() => offset(-7 * DAY)}><Icon className="!text-sm">remove</Icon> 7days</Button>
          <Button variant="sm" onClick={() => offset(-30 * DAY)}><Icon className="!text-sm">remove</Icon> 30days</Button>
          <Button variant="sm" onClick={() => offset(-365 * DAY)}><Icon className="!text-sm">remove</Icon> 365days</Button>
        </div>
      </div>

      <ErrorPanel error={error} label="Error:" />
      <p className="text-sm my-3 italic"><strong>NOTE)</strong> Since <code className=""><DateView date={new Date(0)} /></code></p>

      <UnitsTable />
    </div>
)
}

type DateViewProps = {
  date: Date;
} & HTMLAttributes<HTMLDivElement>;

function DateView({ className, date} : DateViewProps) {

  return (
    <span className={`${className ?? ''}`}>{date.toLocaleString()} [{WEEKDAY[date.getDay()]}]</span>
  )
}


const UNIT_SEC = 1;
const UNIT_MINUTE = 60 * UNIT_SEC;
const UNIT_HOUR = 60 * UNIT_MINUTE;
const UNIT_HALF_DAY = 12 * UNIT_HOUR;
const UNIT_DAY = 24 * UNIT_HOUR;
const UNIT_WEEK = 7 * UNIT_DAY;
const UNIT_30DAYS = 30 * UNIT_DAY;
const UNIT_365DAYS = 365 * UNIT_DAY;

type Unit = {
  name: string;
  second: number;
};

function UnitsTable() {

  const units = useRef<Unit[]>([
    { name: '1 Second', second: UNIT_SEC },
    { name: '1 Minute', second: UNIT_MINUTE },
    { name: '1 Hour', second: UNIT_HOUR },
    { name: '12 Hours', second: UNIT_HALF_DAY },
    { name: '24 Hours', second: UNIT_DAY },
    { name: '1 Week', second: UNIT_WEEK },
    { name: '30 Days', second: UNIT_30DAYS},
    { name: '365 Days', second: UNIT_365DAYS },
  ]);
  
  return (
    <div className="overflow-x-hidden">
      <h2>Units</h2>
      <Table className="overflow-x-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 p-1"></th>
            <th className="border border-gray-300 p-1">Second(s)</th>
            <th className="border border-gray-300 p-1">Millisecond(s)</th>
          </tr>
        </thead>
        <tbody>
          {
            units.current.map((u, i) => (
              <tr key={`unit=${i}`}>
                <td className="border border-gray-300 p-1 whitespace-nowrap">{u.name}</td>
                <td className="border border-gray-300 p-1">{u.second.toLocaleString()}</td>
                <td className="border border-gray-300 p-1">{(u.second * 1000).toLocaleString()}</td>
              </tr>
            ))
          }
          
        </tbody>
      </Table>
    </div>
  )
}
