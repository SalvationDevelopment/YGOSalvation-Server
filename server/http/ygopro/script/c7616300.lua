--Chicken Race
function c7616300.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CHANGE_DAMAGE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetRange(LOCATION_FZONE)
	e2:SetCondition(c7616300.abdcon1)
	e2:SetTargetRange(0,1)
	e2:SetValue(0)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_CHANGE_DAMAGE)
	e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e3:SetRange(LOCATION_FZONE)
	e2:SetCondition(c7616300.abdcon2)
	e3:SetTargetRange(1,0)
	e3:SetValue(0)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_FZONE)
	e4:SetProperty(EFFECT_FLAG_BOTH_SIDE)
	e4:SetCountLimit(1)
	e4:SetCost(c7616300.cost)
	e4:SetCondition(c7616300.condition)
	e4:SetTarget(c7616300.target)
	e4:SetOperation(c7616300.operation)
	c:RegisterEffect(e4)
end
function c7616300.abdcon1(e,tp,eg,ep,ev,re,r,rp)
	local p=e:GetHandler():GetControler()
	return Duel.GetLP(p)<Duel.GetLP(1-p)
end
function c7616300.abdcon2(e,tp,eg,ep,ev,re,r,rp)
	local p=e:GetHandler():GetControler()
	return Duel.GetLP(1-p)<Duel.GetLP(p)
end

function c7616300.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,1000) end
	Duel.PayLPCost(tp,1000)
end
function c7616300.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c7616300.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	op=Duel.SelectOption(tp,aux.Stringid(7616300,0),aux.Stringid(7616300,1),aux.Stringid(7616300,2))
	e:SetLabel(op)
	Duel.SetChainLimit(aux.FALSE)
end

function c7616300.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if e:GetLabel()==0 then
		Duel.Draw(tp,1,REASON_EFFECT)
	end
	if e:GetLabel()==1 then
		Duel.Destroy(c,REASON_EFFECT)
	end
	if e:GetLabel()==2 then
		Duel.Recover(1-tp,1000,REASON_EFFECT)
	end
end
