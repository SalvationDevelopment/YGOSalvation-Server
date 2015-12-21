--D/D/D Cruel Dragon King Beowulf
--Fixed by Ragna_Edge
function c8463720.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFun2(c,aux.FilterBoolFunction(Card.IsSetCard,0x10af),aux.FilterBoolFunction(Card.IsSetCard,0xaf),true)
	--pierce
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_PIERCE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetTarget(c8463720.ttarget)
	c:RegisterEffect(e1)
	--spsumon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetCountLimit(1)
	e2:SetCondition(c8463720.spcon)
	e2:SetTarget(c8463720.target)
	e2:SetOperation(c8463720.activate)
	c:RegisterEffect(e2)
end
function c8463720.ttarget(e,c)
	return c:IsSetCard(0xaf)
end

function c8463720.spcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c8463720.filter(c)
	return c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsDestructable() and c:GetSequence()<5
end
function c8463720.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c8463720.filter,tp,LOCATION_SZONE,LOCATION_SZONE,1,nil) end
	local sg=Duel.GetMatchingGroup(c8463720.filter,tp,LOCATION_SZONE,LOCATION_SZONE,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,sg,sg:GetCount(),0,0)
end
function c8463720.activate(e,tp,eg,ep,ev,re,r,rp)
	local sg=Duel.GetMatchingGroup(c8463720.filter,tp,LOCATION_SZONE,LOCATION_SZONE,e:GetHandler())
	Duel.Destroy(sg,REASON_EFFECT)
end
