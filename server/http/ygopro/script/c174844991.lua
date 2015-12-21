--Exchange of the Spirit (Errata)
function c174844991.initial_effect(c)
	--Activate(summon)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_DRAW_PHASE)
	e1:SetCost(c174844991.actcost)
	e1:SetCondition(c174844991.condition)
	e1:SetCost(c174844991.cost)
	e1:SetOperation(c174844991.activate)
	c:RegisterEffect(e1)
end
function c174844991.actcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,174844991)==0 end
	Duel.RegisterFlagEffect(tp,174844991,0,0,0)
end
function c174844991.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(tp,LOCATION_GRAVE,0)>=15
	and Duel.GetFieldGroupCount(tp,0,LOCATION_GRAVE)>=15
end
function c174844991.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,1000)
	else Duel.PayLPCost(tp,1000) end
end
function c174844991.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.SwapDeckAndGrave(tp)
	Duel.SwapDeckAndGrave(1-tp)
end
