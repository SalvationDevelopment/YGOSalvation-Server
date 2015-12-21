--Sinister Yorishiro
function c80600089.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--decrease tribute
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80600089,0))
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_SZONE)
	e2:SetTargetRange(LOCATION_HAND,0)
	e2:SetCode(EFFECT_SUMMON_PROC)
	e2:SetCondition(c80600089.ntcon)
	e2:SetTarget(c80600089.nttg)
	e2:SetOperation(c80600089.ntop)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_SET_PROC)
	c:RegisterEffect(e3)
	--destroy replace
	local e4=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80600089,1))
	e4:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e4:SetCode(EFFECT_DESTROY_REPLACE)
	e4:SetRange(LOCATION_SZONE)
	e4:SetTarget(c80600089.destg)
	e4:SetValue(1)
	c:RegisterEffect(e4)
end
function c80600089.ntcon(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0 and Duel.GetFlagEffect(tp,80600089)==0
end
function c80600089.nttg(e,c)
	return c:IsLevelAbove(5) and c:IsRace(RACE_FIEND)
end
function c80600089.ntop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.RegisterFlagEffect(tp,80600089,RESET_PHASE+PHASE_END,0,1)
end
function c80600089.tg(c)
	return c:IsRace(RACE_FIEND) and c:IsLevelAbove(5)
end
function c80600089.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	local dc=eg:GetFirst()
	if chk==0 then return eg:GetCount()==1 and dc:IsFaceup() and dc:IsLocation(LOCATION_MZONE)
		and dc:IsRace(RACE_FIEND) and dc:IsLevelAbove(5) and 
		bit.band(dc:GetSummonType(),SUMMON_TYPE_NORMAL)~=0 end
	if Duel.SelectYesNo(tp,aux.Stringid(80600089,1)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		Duel.SendtoGrave(e:GetHandler(),nil,REASON_EFFECT)
		return true
	else return false end
end
