--Dinomist Ceratops
function c13790634.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTarget(c13790634.reptg)
	e2:SetValue(c13790634.repval)
	e2:SetOperation(c13790634.repop)
	c:RegisterEffect(e2)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_FIELD)
	e3:SetCode(EFFECT_SPSUMMON_PROC)
	e3:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e3:SetRange(LOCATION_HAND)
	e3:SetCondition(c13790634.spcon)
	c:RegisterEffect(e3)
end
function c13790634.filter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsSetCard(0x1e71) and (c:IsReason(REASON_BATTLE) or c:IsReason(REASON_EFFECT))
end
function c13790634.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c13790634.filter,1,e:GetHandler(),tp) and not e:GetHandler():IsStatus(STATUS_DESTROY_CONFIRMED) end
	return Duel.SelectYesNo(tp,aux.Stringid(13790634,0))
end
function c13790634.repval(e,c)
	return c13790634.filter(c,e:GetHandlerPlayer())
end
function c13790634.repop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT+REASON_REPLACE)
end

function c13790634.sdfilter(c)
	return c:GetCode()==13790634 or c:IsFacedown()
end
function c13790634.sdfilter2(c)
	return c:IsFaceup() and c:IsSetCard(0x1e71)
end
function c13790634.spcon(e,tp)
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and
		Duel.IsExistingMatchingCard(c13790634.sdfilter2,tp,LOCATION_MZONE,0,1,nil)
		and not	Duel.IsExistingMatchingCard(c13790634.sdfilter,tp,LOCATION_MZONE,0,1,nil)
end
