--Radian, the Multidimensional Kaiju
function c72091687.initial_effect(c)
	c:SetUniqueOnField(1,0,0x223)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_SPSUM_PARAM)
	e1:SetRange(LOCATION_HAND)
	e1:SetTargetRange(POS_FACEUP_ATTACK,1)
	e1:SetCondition(c72091687.spcon)
	e1:SetOperation(c72091687.spop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE+EFFECT_FLAG_SPSUM_PARAM)
	e2:SetRange(LOCATION_HAND)
	e2:SetTargetRange(POS_FACEUP_ATTACK,0)
	e2:SetCondition(c72091687.spcon2)
	c:RegisterEffect(e2)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(9047460,1))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetCost(c72091687.tkcost)
	e3:SetTarget(c72091687.tktg)
	e3:SetOperation(c72091687.tkop)
	c:RegisterEffect(e3)
end
function c72091687.spcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(1-tp,LOCATION_MZONE)>-1
		and Duel.IsExistingMatchingCard(Card.IsReleasable,tp,0,LOCATION_MZONE,1,nil)
		and not Duel.IsExistingMatchingCard(c72091687.spfilter,c:GetControler(),0,LOCATION_MZONE,1,nil)
end
function c72091687.spop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RELEASE)
	local g=Duel.SelectMatchingCard(tp,Card.IsReleasable,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.Release(g,REASON_COST)
end

function c72091687.spfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x223)
end
function c72091687.spcon2(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0 and
		Duel.IsExistingMatchingCard(c72091687.spfilter,c:GetControler(),0,LOCATION_MZONE,1,nil)
end
function c72091687.tkcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsCanRemoveCounter(tp,1,1,0x2a,2,REASON_COST) end
	Duel.RemoveCounter(tp,1,1,0x2a,2,REASON_COST)
end
function c72091687.filter(c,e,tp)
	return c:IsFaceup() and c:IsControler(1-tp) and (not e or c:IsRelateToEffect(e))
end
function c72091687.tktg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c72091687.tkop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	if Duel.IsPlayerCanSpecialSummonMonster(tp,72092687,0,0x4011,2800,0,3,RACE_FIEND,ATTRIBUTE_DARK) then
		local token=Duel.CreateToken(tp,72092687)
		Duel.SpecialSummon(token,0,tp,tp,false,false,POS_FACEUP)
		local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
			e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
			e1:SetValue(1)
			e1:SetReset(RESET_EVENT+0x1fe0000)
		token:RegisterEffect(e1,true)
	end
end