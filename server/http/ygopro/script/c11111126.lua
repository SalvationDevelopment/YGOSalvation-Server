--Dark Tuner Chaos Rogue
function c11111126.initial_effect(c)
	--synchro summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetValue(c11111126.synlimit)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11111126,0))
	e2:SetCategory(CATEGORY_DECKDES)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_BE_MATERIAL)
	e2:SetTarget(c11111126.target)
	e2:SetOperation(c11111126.operation)
	c:RegisterEffect(e2)	
end
function c11111126.synlimit(e,c)
	if not c then return false end
	return not c:GetOriginalCode()==(95453143 or 11111132 or 11111133 or 11111134 or 11111135 or 11111136 or 11111137) or c:IsSetCard(0x91)
end
function c11111126.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DECKDES,nil,0,1-tp,5)
end
function c11111126.operation(e,tp,eg,ep,ev,re,r,rp)
	Duel.DiscardDeck(1-tp,5,REASON_EFFECT)
end