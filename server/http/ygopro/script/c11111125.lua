--Dark Tuner Doom Submarine
function c11111125.initial_effect(c)
	--synchro summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetValue(c11111125.synlimit)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11111125,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCondition(c11111125.spcon)
	e2:SetTarget(c11111125.target)
	e2:SetOperation(c11111125.operation)
	c:RegisterEffect(e2)
end
c11111125[0]=true
c11111125[1]=true
function c11111125.synlimit(e,c)
	if not c then return false end
	return not c:GetOriginalCode()==(95453143 or 11111132 or 11111133 or 11111134 or 11111135 or 11111136 or 11111137) or c:IsSetCard(0x91)
end
function c11111125.spcon(e,c)
	if c==nil then return true end
	return Duel.GetFieldGroupCount(e:GetHandler():GetControler(),LOCATION_MZONE,0)==0
		and Duel.GetLocationCount(e:GetHandler():GetControler(),LOCATION_MZONE)>0
end
function c11111125.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c11111125[tp] and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 
	and c:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
	c11111125[tp]=false
end
function c11111125.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) then return end
	Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP_ATTACK)
end
