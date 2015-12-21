--ゴーストリック・フロスト
function c80800021.initial_effect(c)
	--summon limit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80800021.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80800021,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80800021.postg)
	e2:SetOperation(c80800021.posop)
	c:RegisterEffect(e2)
	--negate attack
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80800021,1))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_ATTACK_ANNOUNCE)
	e3:SetRange(LOCATION_HAND)
	e3:SetCondition(c80800021.spcon1)
	e3:SetTarget(c80800021.sptg)
	e3:SetOperation(c80800021.spop)
	c:RegisterEffect(e3)
end
function c80800021.sfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x8d)
end
function c80800021.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80800021.sfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80800021.postg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80800021)==0 end
	c:RegisterFlagEffect(80800021,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80800021.posop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80800021.spcon1(e,tp,eg,ep,ev,re,r,rp)
	local at=Duel.GetAttacker()
	return at:GetControler()~=tp and Duel.GetAttackTarget()==nil
end
function c80800021.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local tg=Duel.GetAttacker()
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false,POS_FACEDOWN)
		and tg:IsFaceup()
	end
	Duel.SetTargetCard(tg)
	e:SetLabelObject(tg)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,tg,1,0,0)
end
function c80800021.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.ChangePosition(tc,POS_FACEDOWN_DEFENCE)
		if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEDOWN_DEFENCE) then
			Duel.ConfirmCards(1-tp,c)
		end
	end
end