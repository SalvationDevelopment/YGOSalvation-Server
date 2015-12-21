--トゥーン·ヂェミナイ·エルフ
function c1014.initial_effect(c)
	--cannot attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetOperation(c1014.atklimit)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e2)
	local e3=e1:Clone()
	e3:SetCode(EVENT_FLIP_SUMMON_SUCCESS)
	c:RegisterEffect(e3)
	--destroy
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCode(EVENT_LEAVE_FIELD)
	e4:SetCondition(c1014.sdescon)
	e4:SetOperation(c1014.sdesop)
	c:RegisterEffect(e4)
	--direct attack
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetCode(EFFECT_DIRECT_ATTACK)
	e5:SetCondition(c1014.dircon)
	c:RegisterEffect(e5)
	--handes
	local e6=Effect.CreateEffect(c)
	e6:SetDescription(aux.Stringid(1014,0))
	e6:SetCategory(CATEGORY_HANDES)
	e6:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e6:SetCode(EVENT_BATTLE_DAMAGE)
	e6:SetCondition(c1014.condition)
	e6:SetTarget(c1014.target)
	e6:SetOperation(c1014.operation)
	c:RegisterEffect(e6)
end
function c1014.atklimit(e,tp,eg,ep,ev,re,r,rp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e:GetHandler():RegisterEffect(e1)
end
function c1014.sfilter(c)
	return c:IsReason(REASON_DESTROY) and c:IsCode(15259703) and c:IsPreviousLocation(LOCATION_ONFIELD)
end
function c1014.sdescon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c1014.sfilter,1,nil)
end
function c1014.sdesop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end
function c1014.dirfilter1(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c1014.dirfilter2(c)
	return c:IsFaceup() and c:IsType(TYPE_TOON)
end
function c1014.dircon(e)
	return Duel.IsExistingMatchingCard(c1014.dirfilter1,e:GetHandlerPlayer(),LOCATION_ONFIELD,0,1,nil)
		and not Duel.IsExistingMatchingCard(c1014.dirfilter2,e:GetHandlerPlayer(),0,LOCATION_MZONE,1,nil)
end
function c1014.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp
end
function c1014.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_HANDES,nil,0,1-tp,1)
end
function c1014.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(ep,LOCATION_HAND,0)
	if g:GetCount()==0 then return end
	local sg=g:RandomSelect(1-tp,1)
	Duel.SendtoGrave(sg,REASON_EFFECT+REASON_DISCARD)
end
