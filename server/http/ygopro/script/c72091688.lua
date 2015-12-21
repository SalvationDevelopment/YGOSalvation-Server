--Gameciel, the Sea Turtle Kaiju
function c72091688.initial_effect(c)
	c:SetUniqueOnField(1,0,0x223)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_SPSUM_PARAM)
	e1:SetRange(LOCATION_HAND)
	e1:SetTargetRange(POS_FACEUP_ATTACK,1)
	e1:SetCondition(c72091688.spcon)
	e1:SetOperation(c72091688.spop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_SPSUM_PARAM)
	e2:SetRange(LOCATION_HAND)
	e2:SetTargetRange(POS_FACEUP_ATTACK,0)
	e2:SetCondition(c72091688.spcon2)
	c:RegisterEffect(e2)
	--Negate
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(61257789,0))
	e3:SetCategory(CATEGORY_NEGATE+CATEGORY_REMOVE)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_CHAINING)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c72091688.negcon)
	e3:SetCost(c72091688.negcost)
	e3:SetTarget(c72091688.negtg)
	e3:SetOperation(c72091688.negop)
	c:RegisterEffect(e3)
end
function c72091688.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(1-tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(Card.IsReleasable,tp,0,LOCATION_MZONE,1,nil)
		and not Duel.IsExistingMatchingCard(c72091688.spfilter,c:GetControler(),0,LOCATION_MZONE,1,nil)
end
function c72091688.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RELEASE)
	local g=Duel.SelectMatchingCard(tp,Card.IsReleasable,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.Release(g,REASON_COST)
end

function c72091688.spfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x223)
end
function c72091688.spcon2(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0 and
		Duel.IsExistingMatchingCard(c72091688.spfilter,c:GetControler(),0,LOCATION_MZONE,1,nil)
end

function c72091688.filter(c,e,tp)
	return c:IsFaceup() and c:IsControler(1-tp) and (not e or c:IsRelateToEffect(e))
end
function c72091688.negcon(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED) and Duel.IsChainNegatable(ev)
	and not re:GetHandler():IsCode(72091688)
end
function c72091688.negcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsCanRemoveCounter(tp,1,1,0x2a,2,REASON_COST) end
	Duel.RemoveCounter(tp,1,1,0x2a,2,REASON_COST)
end
function c72091688.negtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
	if re:GetHandler():IsDestructable() and re:GetHandler():IsRelateToEffect(re) then
		Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end
function c72091688.negop(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
	if re:GetHandler():IsRelateToEffect(re)then
		Duel.Remove(eg,POS_FACEUP,REASON_EFFECT)
	end
end